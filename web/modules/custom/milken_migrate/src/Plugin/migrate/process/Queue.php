<?php

namespace Drupal\milken_migrate\Plugin\migrate\process;

use Drupal\Core\Entity\EntityInterface;
use Drupal\eck\EckEntityInterface;
use Drupal\migrate\MigrateException;
use Drupal\migrate\MigrateExecutableInterface;
use Drupal\migrate\MigrateSkipRowException;
use Drupal\migrate\Plugin\MigrateProcessInterface;
use Drupal\migrate\ProcessPluginBase;
use Drupal\migrate\Row;

/**
 * Filter to download image and return media reference.
 *
 * @code
 * field_promo_slide:
 *   plugin: milken_create_queue_from_array
 *   source: field_source_value
 * @endcode
 *
 * Source:
 * The source property from which the title of the slide should
 * be derived.
 *
 * @MigrateProcessPlugin(
 *   id = "milken_create_queue_from_array",
 * );
 */
class Queue extends ProcessPluginBase implements MigrateProcessInterface {

  /**
   * Transform remote image ref into local Media Object.
   *
   * @param mixed $value
   *   Value to import.
   * @param \Drupal\migrate\MigrateExecutableInterface $migrate_executable
   *   Executable migration interface.
   * @param \Drupal\migrate\Row $row
   *   Row object with imported/tranformed data.
   * @param string $destination_property
   *   The property to which this value is destined.
   *
   * @return array|int|mixed|string|null
   *   The Value that the trasformation returns.
   *
   * @throws \Drupal\migrate\MigrateException
   */
  public function transform($value, MigrateExecutableInterface $migrate_executable, Row $row, $destination_property) {
    if ($row->isStub()) {
      return NULL;
    }

    if (
      !isset($this->configuration['source']) ||
      !isset($this->configuration['title_source']) ||
      !isset($this->configuration['queue_machine_name_source'])
    ) {
      return new MigrateException("The :class plugin is not correctly configured. :configuration",
        [
          ":class" => __CLASS__,
          ":configuration" => print_r($this->configuration, TRUE),
        ]);
    }
    $subqueue = \Drupal::entityTypeManager()
      ->getStorage('entity_subqueue')
      ->load('new_subqueue');
    $missing_migrations = [];
    $queue_items = [];
    $queue_title = $row->getSourceProperty($this->configuration['title_source']) . uniqid();
    try {
      $newSubqueue = $subqueue->createDuplicate();
      $newSubqueue->set('name', $queue_title);
      $newSubqueue->set('title', $queue_title);

      foreach ($value as $item) {
        if ($item['type'] == "unknown" || $item['id'] == "missing") {
          return new MigrateSkipRowException('Item UUID is missing');
        }
        $queue_item = $this->getEntityForSubqueue($item);
        if ($queue_item instanceof EckEntityInterface) {
          $missing_migrations[] = ['target_id' => $queue_item->id()];
        }
        else {
          $queue_items[] = ['target_id' => $queue_item->id()];
        }
      }

      $newSubqueue->set('items', $queue_items);
      $newSubqueue->set('field_missing_migrations', $missing_migrations);
      $newSubqueue->save();
      return $newSubqueue;
    }
    catch (\Exception $e) {
      \Drupal::logger('milken_migrate')
        ->error(__CLASS__ . "::Exception: " . $e->getMessage());
      return new MigrateException($e->getMessage() . print_r($row->getDestination(), TRUE));
    }
    catch (\Throwable $t) {
      \Drupal::logger('milken_migrate')
        ->error(__CLASS__ . "::Throwable: " . $t->getMessage());
      return new MigrateException($t->getMessage() . print_r($row->getDestination(), TRUE));
    }
    return NULL;
  }

  /**
   *
   */
  protected function getEntityForSubqueue($jsonapi) : EntityInterface {
    [$entityTypeId, $bundle] = explode('--', $jsonapi['type']);
    $results = \Drupal::entityTypeManager()
      ->getStorage($entityTypeId)
      ->loadByProperties(['uuid' => $jsonapi['id']]);
    if (count($results)) {
      return \Drupal::entityTypeManager()
        ->getStorage($entityTypeId)
        ->load(array_shift($results));
    }
    return $this->createMissingMigration($jsonapi['type'], $jsonapi['id']);
  }

  /**
   *
   */
  protected function createMissingMigration(string $type, string $id) : EntityInterface {
    $mm_storage = \Drupal::entityTypeManager()->getStorage('missing_migration');
    $exists = $mm_storage->getQuery('and')
      ->condition('field_id', $id)
      ->execute();
    if (count($exists)) {
      return $mm_storage->load(reset($exists));
    }
    else {
      $toReturn = $mm_storage->create([
        'type' => 'missing_migration',
        'uuid' => $id,
        'name' => $type,
        'title' => $type,
        'field_type' => $type,
        'field_id' => $id,
      ]);
      $toReturn->save();
      return $toReturn;
    }
  }

}
