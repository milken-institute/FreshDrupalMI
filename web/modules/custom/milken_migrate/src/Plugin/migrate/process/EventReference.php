<?php

namespace Drupal\milken_migrate\Plugin\migrate\process;

use Drupal\migrate\MigrateExecutableInterface;
use Drupal\migrate\ProcessPluginBase;
use Drupal\migrate\Row;

/**
 * Search for Event ID and return reference to internal event entity.
 *
 * @Class BodyEmbed
 * @code
 * field_grid_event_id:
 *   plugin: milken_migrate:event_reference
 *   source: {name where row data appears}
 * @endcode
 *
 * @MigrateProcessPlugin(
 *   id = "milken_migrate:event_reference"
 * );
 */
class EventReference extends ProcessPluginBase {

  /**
   * Main guts of the plugin.
   *
   * @param mixed $value
   *   Incoming value from source row.
   * @param \Drupal\migrate\MigrateExecutableInterface $migrate_executable
   *   Migration executable.
   * @param \Drupal\migrate\Row $row
   *   Row data.
   * @param string $destination_property
   *   Destination Property.
   *
   * @return array
   *   Retruned Data.
   */
  public function transform($value, MigrateExecutableInterface $migrate_executable, Row $row, $destination_property) {
    \Drupal::logger('milken_migrate')
      ->debug(__CLASS__);
    $results = \Drupal::entityTypeManager()
      ->getStorage('event')
      ->getQuery()
      ->condition('field_grid_event_id', $value)
      ->execute();
    if (!empty($results)) {
      return [
        'target_id' => array_shift($results),
      ];
    }
    return [];
  }

}