<?php

namespace Drupal\milken_migrate\Plugin\migrate\destination;

use GuzzleHttp\Client;
use Drupal\Core\Plugin\ContainerFactoryPluginInterface;
use Drupal\migrate\Row;

/**
 * Panel destination plugin.
 *
 * @MigrateDestination(
 *   id = "milken_migrate:panel",
 * )
 */
class Panel extends MilkenMigrateDestinationBase implements ContainerFactoryPluginInterface {

  /**
   * {@inheritDoc}
   */
  public function setRelatedFields(Row $row) {
    //$this->getEvent($row);
    //$this->getRoom($row);
  }

  /**
   * {@inheritDoc}
   */
  public function getBundle(Row $row = NULL) {
    return "panel";
  }

  /**
   * Get related record for room.
   *
   * @param \Drupal\migrate\Row $row
   *   Standard Migration row object.
   */
  public function getRoom(Row $row) {
    $filter = [
      "filter" => [
        "panel_id" => $row->get('pid'),
      ],
    ];
    $response = json_decode(
      $this->getClient($row)
        ->get('/jsonapi/panel/rooms', ['query' => $filter])
        ->getBody(),
      TRUE
    );
    print_r($response);
    exit();

  }

  /**
   * Create reference to event entity.
   *
   * @param \Drupal\migrate\Row $row
   *   Standard migration row.
   *
   * @return array|null
   *   Either return an array of dependent entities or null.
   */
  public function getEvent(Row $row) {
    $entityStorage = \Drupal::getContainer()
      ->get('entity_type.manager')
      ->getStorage('event');
    $results = $entityStorage
      ->getQuery()
      ->condition('field_grid_event_id', $row->getSource()['eventid'])
      ->execute();
    \Drupal::logger(__CLASS__)
      ->debug('Found the following values:' . print_r($results, TRUE));
    if (is_array($results) && $resultID = array_shift($results)) {
      \Drupal::logger(__CLASS__)
        ->debug('Adding value to result set:' . print_r($resultID, TRUE));
      $row->setDestinationProperty('field_event', ['target_id' => $resultID]);
      return ['target_id' => $resultID];
    }
    return NULL;
  }

  /**
   * Get http client for jsonapi call.
   *
   * @param \Drupal\migrate\Row $row
   *   Standard migration row.
   *
   * @return \GuzzleHttp\Client
   *   Guzzle http client.
   */
  protected function getClient(Row $row) {
    return new Client([
      "base_uri" => $row->get('jsonapi_host'),
    ]);
  }

}