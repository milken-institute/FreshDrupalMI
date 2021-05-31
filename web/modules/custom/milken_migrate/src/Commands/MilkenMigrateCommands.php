<?php

// @codingStandardsIgnoreStart

namespace Drupal\milken_migrate\Commands;

use Drupal;
use Drupal\Core\Entity\EntityInterface;
use Drupal\field\Entity\FieldConfig;
use Drupal\migrate\Plugin\MigrationInterface;
use Drupal\milken_migrate\Utility\RemoteRecord;
use Drupal\milken_migrate\Utility\RemoteRecordsList;
use Drush\Commands\DrushCommands;
use Exception;
use GuzzleHttp\Client;
use Throwable;

/**
 * A Drush commandfile.
 *
 * In addition to this file, you need a drush.services.yml
 * in root of your module, and a composer.json file that provides the name
 * of the services file to use.
 *
 * See these files for an example of injecting Drupal services:
 *   - http://cgit.drupalcode.org/devel/tree/src/Commands/DevelCommands.php
 *   - http://cgit.drupalcode.org/devel/tree/drush.services.yml
 */
class MilkenMigrateCommands extends DrushCommands
{

  /**
   * @var \GuzzleHttp\Client
   */
  protected Client $client;

  /**
   * @var array
   */
  protected array $defaultOptions = [];

  /**
   * Update local articles with remote Author information.
   *
   * @usage drush milken_migrate:author_relations
   *   'https://www.milkeninstitute.org/jsonapi/node/article?include=field_ar_author'
   *   field_ar_author node field_authors -v
   *
   * @description  Grab a list of articles, get their
   *   author and update local version of the article with the local version of
   *   the author.
   *
   * @command milken_migrate:author_relations
   * @aliases mmar
   *
   * @param string $sourceUrl
   *  Url from which to obtain a list of source Entities.
   * @param string $sourceField
   *  String field name on the source object.
   * @param string $destinationEntityTypeId
   *  String EntityTypeId where the author will be updated.
   * @param string $destinationEntityField
   *  String name of the field to be updated.
   */
  public function migrateAuthorRelations(
    string $sourceUrl,
    string $sourceField,
    string $destinationEntityTypeId,
    string $destinationEntityField
  ) {
    $destinationEntityStorage = Drupal::entityTypeManager()
      ->getStorage($destinationEntityTypeId);
    $field_config_ids = Drupal::entityQuery('field_config')
      ->accessCheck(false)
      ->condition('field_type', 'entity_reference')
      ->condition('field_name', $destinationEntityField)
      ->condition('entity_type', $destinationEntityTypeId)
      ->condition('status', 1)
      ->execute();
    if (is_array($field_config_ids) && $fc_id = array_shift($field_config_ids)) {
      $field_config = Drupal::entityTypeManager()
        ->getStorage('field_config')
        ->load($fc_id);
      if ($field_config instanceof FieldConfig) {
        $settings = $field_config->getSettings();
        $referencedEntity = isset($settings['handler']) ? str_replace("default:", "", $settings['handler']) : null;
      }
    }

    if (!is_string($referencedEntity) || empty($referencedEntity) || $referencedEntity === null) {
      throw new Exception("Cannot determine referenced entity type. It's not apparent from the field config which entity will be referenced.");
    }

    $imported_records = 0;
    $url = $sourceUrl;
    do {
      try {
        $page = $this->getPageOfData($url);
        foreach ($page['data'] as $articleData) {
          $articleData = new RemoteRecord($articleData);
          if ($articleData->valid() && $localCopy = $articleData->getLocalVersion($destinationEntityTypeId)) {
            // Is there a valid value to replace?
            $fieldData = $articleData->getField($sourceField);
            if (isset($fieldData['data']) && empty($fieldData['data'])) {
              // field has not been initialized on original data database
              $fieldData = [];
            }
            // Ensure sane data.
            if (!is_array($fieldData) && !empty($fieldData)) {
              $fieldData = [$fieldData];
            }
            foreach ($fieldData as $record) {
              $record = new RemoteRecord($record);
              // if it's a valid record, get local copy of the UUID match.
              $localCopyOfAuthor = $record->valid() ? $record->getLocalVersion($referencedEntity) : null;
              // If this is true, we are a go for replacement.
              if ($localCopyOfAuthor instanceof EntityInterface) {
                $localCopy->{$destinationEntityField}[] = $localCopyOfAuthor;
                $localCopy->save();
                $this->logger()
                  ->success(dt('Article Author Migrated::' . print_r($localCopy->toArray()[$destinationEntityField], true)));
                continue;
              }
            }
            $this->logger()
              ->info('Skipped: ' . $localCopy->label());
          }
        }
      } catch (Exception $e) {
        Drupal::logger('milken_migrate')
          ->error($e->__toString());
        exit(1);
      } catch (Throwable $t) {
        Drupal::logger('milken_migrate')
          ->critical(sprintf("THROWABLE Line %d: %s", $t->getLine(), $t->getMessage()));
        print_r($t->__toString());
        exit(1);
      }
      $url = $page['links']['next']['href'] ?? null;
    } while ($url !== null);
  }

  /**
   * @param string $url
   *
   * @return array
   */
  protected function getPageOfData(string $url): array
  {
    $parsed = parse_url($url);
    parse_str($parsed['query'] ?? "", $query);
    $query['jsonapi_include'] = true;
    $response = Drupal::httpClient()
      ->get($parsed['path'], array_merge($this->defaultOptions, [
        'query' => $query,
      ]));
    if (in_array($response->getStatusCode(), [200, 201, 202])) {
      return json_decode($response->getBody(), true);
    }
    $this->logger()->warning('URL returned invalid status code: ' . $url);
    exit(-1);
  }

  /**
   * Drush command: Podcast Persons.
   *
   * @command milken_migrate:podcast_persons
   * @aliases mmpp
   *
   * @throws Drupal\Component\Plugin\Exception\InvalidPluginDefinitionException
   * @throws Drupal\Component\Plugin\Exception\PluginNotFoundException
   */

  public function podcastPersons()
  {
    $storage = Drupal::entityTypeManager()
      ->getStorage('media');
    $episodesIDs = $storage->getQuery()
      ->condition('bundle', 'podcast_episode')
      ->condition('status', true)
      ->execute();
    foreach ($episodesIDs as $epid) {
      $episode = \Drupal::entityTypeManager()
        ->getStorage('media')
        ->load($epid);
      if ($episode instanceof EntityInterface) {
        $media_images = $episode
          ->get('field_media_image')
          ->referencedEntities();
        foreach ($media_images as $image) {
          $person = \Drupal::entityTypeManager()
            ->getStorage('people')
            ->create([
              'type' => 'person',
            ]);
          if ($person instanceof EntityInterface) {
            $person->field_photo[] = [
              'target_id' => $image->id(),
            ];
            $episodeRemoteRecord = RemoteRecord::getRemoteRecord('paragraph', "podcast_episode", $episode->uuid() . "?jsonapi_include=true&include=field_podcast_image");
            $array = $episodeRemoteRecord->getField('field_podcast_image');
            $imageRemoteRecord = @array_shift($array);
            if (!empty($imageRemoteRecord)) {
              $personNamesArray = explode(" ", trim($imageRemoteRecord['field_photo_subject_name']));

              if (count($personNamesArray) == 2) {
                $person->field_first_name = array_shift($personNamesArray);
                $person->field_last_name = array_shift($personNamesArray);
                echo "\nFirst Name & Last Name \n\n";
              } elseif (count($personNamesArray) == 3) {
                $person->field_first_name = array_shift($personNamesArray);
                $person->field_middle_name = array_shift($personNamesArray);
                $person->field_last_name = array_shift($personNamesArray);
                echo "\nFirst Name, Middle Name & Last Name \n\n";
              } elseif (count($personNamesArray) > 3) {
                $person->field_first_name = array_shift($personNamesArray);
                $person->field_middle_name = array_shift($personNamesArray);
                $person->field_last_name = join(" ", $personNamesArray);
                echo "\nTOO MANY NAMES!!!!!! \n\n";
              } else {
                $person->field_first_name = join(" ", $personNamesArray);
                echo "\nWHAT IS EVEN THIS???????? \n\n";
              }

              $person->field_pgtitle = $imageRemoteRecord['field_photo_subject_title'];

            }
            $person->enforceIsNew();
            $person->save();
          }
          echo "End of current loop iteration \n\n\n";
        }
        $episode->field_guests[] = [
          'target_id' => $person->id(),
        ];
        $episode->save();
      }
    }
  }

  /**
   * Drush command get missing field.
   *
   * @command milken_migrate:author_text
   * @aliases mmat
   *
   */
  public function migrate_field_custom_author_text()
  {
    $storage = Drupal::entityTypeManager()
      ->getStorage('media');
    $videoIDs = $storage->getQuery()
      ->condition('bundle', 'video')
      ->condition('status', true)
      ->execute();
    foreach ($videoIDs as $videoID) {
      $video = $storage->load($videoID);
      $videoRemoteRecord = RemoteRecord::getRemoteRecord('node', 'video', $video->uuid() . "?jsonapi_include=true");
      if ($videoRemoteRecord instanceof RemoteRecord) {
        $remoteField = $videoRemoteRecord->getField('field_custom_author_text');
        if (isset($remoteField['value'])) {
          $remoteCompareValue = mb_strtolower(strip_tags($remoteField['value']));
          $localCompareValue = mb_strtolower(strip_tags($video->get('field_body')->value));
          // DO NOT DOUBLE-ADD the value to the field. If it's there, no op.
          if (mb_strpos($localCompareValue, $remoteCompareValue) === false) {
            $newBodyValue = [
              'value' => $video->get('field_body')->value . $remoteField['value'],
              'format' => $video->get('field_body')->format,
            ];
            $video->field_body = $newBodyValue;
            $video->save();
          }

        }
      }
    }
  }

  /**
   * Drush command get missing published_at field value.
   *
   * @command milken_migrate:article_published_at
   * @aliases mmapa
   *
   */
  public function migrate_article_published_at()
  {
    $storage = Drupal::entityTypeManager()
      ->getStorage('node');
    $articleIDs = $storage->getQuery()
      ->condition('type', 'article')
      ->condition('status', true)
      ->execute();
    foreach ($articleIDs as $articleID) {
      $article = $storage->load($articleID);
      $articleRemoteRecord = RemoteRecord::getRemoteRecord('node', 'article', $article->uuid() . "?jsonapi_include=true");
      if ($articleRemoteRecord instanceof RemoteRecord) {
        $remoteField = $articleRemoteRecord->getField('published_at');
        \Drupal::logger('milken_migrate REMOTE PUBLISHED_AT FIELD: ')
          ->info((string)$remoteField);
        if ($remoteField) {
          $article->published_at = strtotime($remoteField);
          $article->save();

        }
      }
    }
  }

  /**
   * Drush command get missing published_at field value.
   *
   * @command milken_migrate:report_published_at
   * @aliases mmrpa
   *
   */
  public function migrate_report_published_at()
  {
    $storage = Drupal::entityTypeManager()
      ->getStorage('media');
    $reportIDs = $storage->getQuery()
      ->condition('bundle', 'report')
      ->condition('status', true)
      ->execute();
    foreach ($reportIDs as $reportID) {
      $report = $storage->load($reportID);
      $reportRemoteRecord = RemoteRecord::getRemoteRecord('node', 'report', $report->uuid() . "?jsonapi_include=true");
      if ($reportRemoteRecord instanceof RemoteRecord) {
        $remoteField = $reportRemoteRecord->getField('published_at');
        \Drupal::logger('milken_migrate REMOTE PUBLISHED_AT FIELD: ')
          ->info((string)$remoteField);
        if ($remoteField) {
          $report->published_at = strtotime($remoteField);
          $report->save();

        }
      }
    }
  }

  /**
   * Drush command get missing published_at field value.
   *
   * @command milken_migrate:video_published_at
   * @aliases mmvpa
   *
   */
  public function migrate_video_published_at()
  {
    $storage = Drupal::entityTypeManager()
      ->getStorage('media');
    $videoIDs = $storage->getQuery()
      ->condition('bundle', 'video')
      ->condition('status', true)
      ->execute();
    foreach ($videoIDs as $videoID) {
      $video = $storage->load($videoID);
      $videoRemoteRecord = RemoteRecord::getRemoteRecord('node', 'video', $video->uuid());
      if ($videoRemoteRecord instanceof RemoteRecord) {
        $remoteField = $videoRemoteRecord->getField('published_at');
        \Drupal::logger('milken_migrate REMOTE PUBLISHED_AT FIELD: ')
          ->info((string)$remoteField);
        if ($remoteField) {
          $video->published_at = strtotime($remoteField);
          $video->save();

        }
      }
    }
  }

  /**
   * Drush command to migrate MetaTags from old site to new.
   *
   * @command milken_migrate:meta_tags
   * @aliases mmmt
   *
   * @param string $source
   * @param string $destination
   *
   * @example drush mmmt node:article:field_meta_tags node:article:field_meta_tags
   * @example drush mmmt node:video:field_meta_tags media:video:field_meta_tags
   *
   */
  public function migrateMetaTags(
    $source, $destination
  ) {
    @[$sourceEntity, $sourceBundle, $sourceField, $uuid] = explode(":", $source);
    [$destinationEntity, $destinationBundle, $destinationField] = explode(":", $destination);
    $remoteList = new RemoteRecordsList($sourceEntity, $sourceBundle);
    if ($uuid !== null) {
      $remoteList->addRecord($uuid);
    }
    $updated = 0;
    \Drupal::logger(__CLASS__)->info("Refreshing import list...");
    for ($remoteList->rewind(); $remoteList->valid(); $remoteList->next()) {
      $record = $remoteList->current();
      if ($record instanceof RemoteRecord) {
        $valueToSet = $record->getField($sourceField);
        if (!empty($valueToSet)) {
          $queryResults = \Drupal::entityTypeManager()
            ->getStorage($destinationEntity)
            ->loadByProperties(['uuid' => $record->getId()]);
          if (
            !empty($queryResults) &&
            reset($queryResults) instanceof EntityInterface
          ) {
            $localCopy = array_shift($queryResults);
            $localCopy->{$destinationField}->setValue(serialize($valueToSet));
            $localCopy->save();
            $updated += 1;
          }
        }
      }
      // TODO: do this the right way...
      fwrite(STDERR, $this->progressBar($remoteList->key(), $remoteList->count()));
    }
    \Drupal::logger('milken_migrate:singlefield')
      ->info(sprintf("Updated %d records", $updated) . PHP_EOL);
  }


  /**
   * @param $done
   * @param $total
   */
  protected
  function progressBar($done, $total)
  {
    $perc = floor(($done / $total) * 100);
    $left = 100 - $perc;
    return sprintf(
      "\033[0G\033[2K[%'={$perc}s>%-{$left}s] - $perc%% - $done/$total",
      "",
      ""
    );
  }

  /**
   * Migrate a single event from Grid export.
   *
   * @usage drush milken_migrate:author_relations
   *   'https://www.milkeninstitute.org/jsonapi/node/article?include=field_ar_author'
   *   field_ar_author node field_authors -v
   *
   * @description
   * Ensure an event and all its details are migrated with the most recent data.
   *
   * @command milken_migrate:migrate_grid_event
   * @aliases mgrid
   *
   * @param string $eventID
   *   The grid_event_id of the event in question.
   */
  public function migrateGridEvent(string $eventID)
  {
    $manager = Drupal::service('plugin.manager.migration');
    $migration_ids = ['grid_event'];
    foreach ($migration_ids as $migration_id) {
      $migration = $manager->createInstance($migration_id);
      if ($migration instanceof Drupal\migrate\Plugin\Migration) {
        $migration->setStatus(MigrationInterface::STATUS_IDLE);
        $migration->getIdMap()->prepareUpdate();
        $source = $migration->getSourcePlugin();
        if ($source instanceof Drupal\migrate_plus\Plugin\migrate\source\Url) {
          $source->getDataParserPlugin()->singleton($eventID);
          $executable = new Drupal\migrate\MigrateExecutable($migration);
          try {
            // Run the migration.
            $executable->import();
          }
          catch (\Exception $e) {
            $migration->setStatus(MigrationInterface::STATUS_IDLE);
          }
        }
      }
    }
    //drush migrate:import grid_event --update
    //drush migrate:import panels --update
    //drush migrate:import grid_panel_speakers --update
    //drush migrate:import grid_panel_tracks --update
    //drush migrate:import grid_speakers --update
    //drush migrate:import grid_tracks --update
    //drush php:eval 'milken_migrate_update_grid_panel()'

  }

}
