<?php

namespace Drupal\milken_migrate\Plugin\migrate\process;

use Drupal\Core\Entity\EntityInterface;
use Drupal\migrate\MigrateExecutableInterface;
use Drupal\migrate\MigrateSkipProcessException;
use Drupal\migrate\ProcessPluginBase;
use Drupal\migrate\Row;
use Drupal\milken_migrate\Plugin\migrate\destination\TaxonomyTerm;
use Drupal\milken_migrate\Traits\JsonAPIDataFetcherTrait;
use Drupal\taxonomy\Entity\Term;

/**
 * This plugin gets a taxonomy term and returns the ID in a jsonAPI Migration.
 *
 * @MigrateProcessPlugin(
 *   id = "jsonapi_taxonomy",
 *   handle_multiples=true,
 * )
 */
class JsonAPITaxonomy extends ProcessPluginBase {

  use JsonAPIDataFetcherTrait;

  /**
   * The main function for the plugin, actually doing the data conversion.
   */
  public function transform($value, MigrateExecutableInterface $migrate_executable, Row $row, $destination_property) {
    if ((isset($value['data']) && empty($value['data'])) ||
      empty($value)
    ) {
      return [];
    }
    $destination_values = [];
    if (is_array($value)) {
      foreach ($value as $relatedRecord) {
        if (isset($relatedRecord['id']) && $relatedRecord['type'] != "missing") {
          $term = \Drupal::entityTypeManager()
            ->getStorage('taxonomy_term')
            ->loadByProperties(['uuid' => $relatedRecord['id']]);
          if (count($term)) {
            $term = array_shift($term);
          }
          else {
            $term = TaxonomyTerm::create($this->getRelatedRecordData($relatedRecord, $row));
            if ($term instanceof EntityInterface) {
              $term->isNew();
              $term->save();
            }
            else {
              $row->setDestinationProperty($destination_property, []);
              return new MigrateSkipProcessException(
                "Cannot create taxonomy Term:" . print_r($relatedRecord, TRUE)
              );
            }
          }
        }
        if ($term instanceof Term) {
          $destination_values[] = ['entity' => $term];
        }
        else {
          return NULL;
        }
      }
    }
    $row->setDestinationProperty($destination_property, $destination_values);
    return $destination_values;
  }

}
