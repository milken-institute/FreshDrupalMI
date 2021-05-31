<?php

namespace Drupal\milken_migrate\Plugin\migrate_plus\data_parser;

use Drupal\Component\Utility\UrlHelper;
use Drupal\Core\Url;
use Drupal\Core\Plugin\ContainerFactoryPluginInterface;
use Symfony\Component\DependencyInjection\ContainerInterface;
use Drupal\Core\Config\ConfigFactory;
use Drupal\Core\Extension\ModuleHandler;
use Drupal\migrate\MigrateException;
use Drupal\milken_migrate\Form\MigrateSettingsForm;
use Drupal\migrate_plus\DataParserPluginBase;

/**
 * Obtain JSON data for migration.
 *
 * @example
 * ```yml
 *  source:
 *    plugin: url
 *    jsonapi_host: http://host.com
 *    jsonapi_endpoint: /jsonapi/node/article
 *    jsonapi_filters:
 *      conditions:
 *        -
 *          key: tags_filter
 *          path: field_tags.name
 *          operator: =
 *          value: t1
 *    data_parser_plugin: jsonapi
 *    data_fetcher_plugin: http
 *    ids:
 *      nid:
 *        type: integer
 *    fields:
 *      -
 *        name: nid
 *        selector: /attributes/drupal_internal__nid
 *      -
 *        name: title
 *        selector: /attributes/title
 *      -
 *        name: tags
 *        selector: /attributes/drupal_internal__tid
 *        relationship: field_tags
 *  ```
 *
 * @DataParser(
 *   id = "jsonapi",
 *   title = @Translation("JSON:API")
 * )
 */
class Jsonapi extends DataParserPluginBase implements ContainerFactoryPluginInterface {

  /**
   * Is this for a single record?
   *
   * @var string
   */
  protected ?string $singleton = NULL;

  /**
   * Iterator over the JSON data.
   *
   * @var \Iterator
   */
  protected \Iterator $dataIterator;

  /**
   * Iterator over the JSON data.
   *
   * @var \Iterator
   */
  protected \Iterator $includedIterator;

  /**
   * Config Factory.
   *
   * @var [Drupal\Core\Config\ConfigFactory]
   */
  private $configFactory;

  /**
   * Module handler.
   *
   * @var [Drupal\Core\Extension\ModuleHandler]
   */
  private $moduleHandler;

  /**
   * {@inheritdoc}
   */
  public function __construct(array $configuration, $plugin_id, $plugin_definition, ConfigFactory $config_factory, ModuleHandler $module_handler) {
    $this->configFactory = $config_factory;
    $this->moduleHandler = $module_handler;

    // Just compatible with base module DataParsePluginBase.
    // @todo Rewrite base class or set our real item selector.
    if (!isset($configuration['item_selector'])) {
      $configuration['item_selector'] = '';
    }

    if (!isset($configuration['jsonapi_endpoint'])) {
      throw new MigrateException('JsonAPI endpoint not set.');
    }

    $jsonapi_host = $this->configFactory
      ->get(MigrateSettingsForm::MIGRATE_JSONAPI_SETTINGS)
      ->get(MigrateSettingsForm::JSONAPI_REMOTE_HOST);

    if (empty($jsonapi_host) && isset($configuration['jsonapi_host'])) {
      $jsonapi_host = $configuration['jsonapi_host'];
    }

    if (empty($jsonapi_host)) {
      throw new MigrateException('JsonAPI host not set.');
    }
    if (is_array($configuration['jsonapi_endpoint'])) {
      $configuration['urls'] = array_map(function ($item) use ($jsonapi_host) {
        return $jsonapi_host . $item;
      }, $configuration['jsonapi_endpoint']);
    }
    else {
      $configuration['urls'] = [$jsonapi_host . $configuration['jsonapi_endpoint']];
    }
    parent::__construct($configuration, $plugin_id, $plugin_definition);

  }

  /**
   * {@inheritdoc}
   */
  public static function create(ContainerInterface $container, array $configuration, $plugin_id, $plugin_definition) {
    return new static(
      $configuration,
      $plugin_id,
      $plugin_definition,
      $container->get('config.factory'),
      $container->get('module_handler')
    );
  }

  /**
   * Retrieves the JSON data and returns it as an array.
   *
   * @param string $url
   *   URL of a JSON feed.
   *
   * @return array
   *   The selected data to be iterated.
   *
   * @throws \GuzzleHttp\Exception\RequestException
   */
  protected function getSource($url) {
    if ($this->singleton !== NULL) {
      $url .= $this->singleton;
    }
    if (isset($this->configuration['jsonapi_include']) && $this->configuration['jsonapi_include'] === TRUE) {
      $conjunction = (strpos($url, "?") === FALSE) ? "?" : "&";
      $url .= $conjunction . "jsonapi_include=true";
    }
    if (isset($this->configuration['jsonapi_sort'])) {
      $url .= "&sort=" . $this->configuration['jsonapi_sort'];
    }

    $response = $this->getDataFetcherPlugin()->getResponseContent($url);
    // Convert objects to associative arrays.
    $source = json_decode($response, TRUE, 512, JSON_THROW_ON_ERROR);
    // If json_decode() has returned NULL, it might be that the data isn't
    // valid utf8 - see http://php.net/manual/en/function.json-decode.php#86997.
    if (is_null($source)) {
      $utf8response = utf8_encode($response);
      $source = json_decode($utf8response, TRUE, 512, JSON_THROW_ON_ERROR);
    }

    return $source;
  }

  /**
   * Retrieves the JSON data and returns it as an array.
   *
   * @param string $source
   *   URL of a JSON feed.
   *
   * @return array
   *   The selected data to be iterated.
   *
   * @throws \GuzzleHttp\Exception\RequestException
   */
  protected function getSourceData($source) {
    if (!isset($source['data'])) {
      throw new \Exception(print_r($source));
    }
    if ($this->singleton !== NULL) {
      return [$source['data']];
    }
    $data = [];
    $selectors = explode('/', trim('data/', '/'));
    foreach ($selectors as $selector) {
      if (!empty($selector)) {
        $data = $source[$selector];
      }
    }

    return $data;
  }

  /**
   * Retrieves the JSON data and returns it as an array.
   *
   * @param string $source
   *   URL of a JSON feed.
   *
   * @return array
   *   The selected data to be iterated.
   *
   * @throws \GuzzleHttp\Exception\RequestException
   */
  protected function getSourceIncluded($source) {
    if (!isset($source['included'])) {
      return [];
    }
    $included = [];
    // @todo .
    $selectors = explode('/', trim('included/', '/'));
    foreach ($selectors as $selector) {
      if (!empty($selector)) {
        $included = $source[$selector];
      }
    }

    return $included;
  }

  /**
   * {@inheritdoc}
   */
  protected function openSourceUrl($url) {
    $parts = UrlHelper::parse($url, ['scheme' => 'https']);
    $options['query'] = $parts['query'];
    $options['fragment'] = $parts['fragment'];
    $options['verify'] = FALSE;
    // Extract all relationship definition and add to URL as included.
    $relationships = [];
    foreach ($this->configuration['fields'] as $field) {
      if (isset($field['relationship'])) {
        $relationships[] = $field['relationship'];
      }
    }
    if (!empty($relationships)) {
      if (isset($parts['include'])) {
        $include = explode(',', $parts['include']);
        $include = array_flip($include);
      }
      else {
        $include = [];
      }
      foreach ($relationships as $relationship) {
        $include[$relationship] = 1;
      }
      $options['query']['include'] = implode(',', array_keys($include));
    }

    if (!empty($this->configuration['jsonapi_filters'])) {
      $filters = [];
      foreach ($this->configuration['jsonapi_filters'] as $key => $value) {
        if ($key == 'groups') {
          foreach ($value as $v) {
            if (isset($v['key']) && isset($v['conjunction'])) {
              $filters['filter'][$v['key']]['group'][conjunction] = $v['conjunction'];
            }
          }
        }
        if ($key == 'conditions') {
          foreach ($value as $v) {
            if (isset($v['key']) && isset($v['path']) && isset($v['operator'])) {
              $filters['filter'][$v['key']]['condition']['path'] = $v['path'];
              if (isset($v['value'])) {
                $filters['filter'][$v['key']]['condition']['value'] = $v['value'];
              }
              $filters['filter'][$v['key']]['condition']['operator'] = $v['operator'];
              if (isset($v['memberOf'])) {
                $filters['filter'][$v['key']]['condition']['memberOf'] = $v['memberOf'];
              }
            }
          }
        }
      }

      $options['query'] = array_merge($options['query'], $filters);
    }
    $path = $parts['path'];

    // Add hook_migrate_plus_data_parser_jsonapi_pre_request_alter() to update
    // jsonapi filter or relationships.
    $this->moduleHandler->alter('migrate_plus_data_parser_jsonapi_pre_request', $path, $options, $this);

    $url = Url::fromUri($path, $options)->toString();

    // (Re)open the provided URL.
    $source = $this->getSource($url);

    $this->dataIterator = new \ArrayIterator($this->getSourceData($source));
    $this->includedIterator = new \ArrayIterator($this->getSourceIncluded($source));
    if (isset($source['links']['next'])) {
      if (is_string($source['links']['next'])) {
        $this->urls[] = $source['links']['next'];
      }
      elseif (is_array($source['links']['next'])) {
        $this->urls[] = $source['links']['next']['href'];
      }
    }
    return TRUE;
  }

  /**
   * {@inheritdoc}
   */
  protected function fetchNextRow() {
    $current = $this->dataIterator->current();
    if ($current) {
      foreach ($this->fieldSelectors() as $field_name => $field_info) {
        if (isset($field_info['relationship'])) {
          $field_data = $current;
          // Explode for multiple level relationships,
          // eg: field_thumbnail.image.
          $relationship_fields = explode('.', $field_info['relationship']);

          // For relationship in multiple levels.
          if (count($relationship_fields) > 1) {
            foreach ($relationship_fields as $relationship_field_name) {
              $field_data = $this->getIncludeObject($field_data, $relationship_field_name);
            }
          }
          else {
            // Multiple values is only supported relationship in 1 level.
            $is_multiple = isset($field_info['multiple']) && $field_info['multiple'];
            $field_data = $this->getIncludeObject($field_data, $relationship_fields[0], $is_multiple);
          }
        }
        else {
          $field_data = $current;
        }

        if (!is_null($field_data)) {
          $selector = $field_info['selector'];
          $field_selectors = explode('/', trim($selector, '/'));
          if (isset($field_info['multiple']) && $field_info['multiple']) {
            foreach ($field_selectors as $field_selector) {
              array_walk($field_data, function (&$v) use ($field_selector) {
                if (is_array($v) && array_key_exists($field_selector, $v)) {
                  $v = $v[$field_selector];
                }
              });
            }
          }
          else {
            foreach ($field_selectors as $field_selector) {
              if (is_array($field_data) && array_key_exists($field_selector, $field_data)) {
                $field_data = $field_data[$field_selector];
              }
              else {
                $field_data = '';
              }
            }
          }
        }
        $this->currentItem[$field_name] = $field_data;
      }
      if (!empty($this->configuration['include_raw_data'])) {
        $this->currentItem['raw'] = $current;
      }
      $this->dataIterator->next();
    }
  }

  /**
   * Get include values.
   */
  private function getIncludeObject($current, $relationship_field_name, $is_multiple = FALSE) {
    if (!isset($current['relationships'][$relationship_field_name])) {
      return $current;
    }

    $relationship_data = $current['relationships'][$relationship_field_name]['data'];
    if (empty($relationship_data)) {
      return NULL;
    }
    $field_data = [];
    if (isset($relationship_data['type'])) {
      $relationships[] = $relationship_data;
    }
    else {
      $relationships = $relationship_data;
    }
    foreach ($relationships as $relationship) {
      foreach ($this->includedIterator as $included) {
        if ($included['type'] == $relationship['type'] && $included['id'] == $relationship['id']) {
          if (isset($relationship['meta'])) {
            $included['meta'] = $relationship['meta'];
          }
          $field_data[] = $included;
        }
      }
    }
    if ($is_multiple) {
      $field_data = $field_data;
    }
    else {
      $field_data = array_shift($field_data);
    }
    return $field_data;
  }

  /**
   * Return the selectors used to populate each configured field.
   *
   * @return string[]
   *   Array of selectors, keyed by field name.
   */
  protected function fieldSelectors() {
    $fields = [];
    foreach ($this->configuration['fields'] as $field_info) {
      if (isset($field_info['selector'])) {
        $fields[$field_info['name']] = $field_info;
      }
    }
    return $fields;
  }

  /**
   * Getter function for configuration.
   */
  public function getConfiguration() {
    return $this->configuration;
  }

  /**
   * For importing a single Event record.
   */
  public function singleton(string $id) {
    $this->singleton = $id;
  }

}
