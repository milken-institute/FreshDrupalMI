import Paragraph, { ParagraphInterface } from "../../DataTypes/Paragraph";
import ParagraphAuthor from "../../DataTypes/ParagraphAuthor";
import ParagraphBlock from "../../DataTypes/ParagraphBlock";
import ParagraphBodyContent from "../../DataTypes/ParagraphBodyContent";
import {
  ParagraphContentTiles,
  ParagraphEntityQueueTiles,
  ParagraphEventTiles,
  ParagraphMediaTiles,
  ParagraphSlideTiles,
  ParagraphTilesSocial,
  ParagraphTilesSponsors,
} from "../../DataTypes/ParagraphTiles";
import ParagraphPeople from "../../DataTypes/ParagraphPeople";
import ParagraphPodcastEpisode from "../../DataTypes/ParagraphPodcastEpisode";
import ParagraphProgramDay from "../../DataTypes/ParagraphProgramDay";
import ParagraphPullQuote from "../../DataTypes/ParagraphPullQuote";
import ParagraphSlide from "../../DataTypes/ParagraphSlide";
import ParagraphStats from "../../DataTypes/ParagraphStats";
import ParagraphFacetExplorer from "../../DataTypes/ParagraphFacetExplorer";
/**
 * Create the DataModel
 *
 * @param props: MediaDisplayProps
 */

export const ParagraphDataFactory = (incoming: ParagraphInterface) => {
  console.debug("Paragraph Data Factory:", incoming);
  if (incoming instanceof Paragraph) {
    return incoming;
  }
  switch (incoming.type) {
    case "paragraph--author":
      return new ParagraphAuthor(incoming);
    case "paragraph--block":
      return new ParagraphBlock(incoming);
    case "paragraph--body_content":
      return new ParagraphBodyContent(incoming);
    case "paragraph--content_tiles":
      return new ParagraphContentTiles(incoming);
    case "paragraph--event_tiles":
      return new ParagraphEventTiles(incoming);
    case "paragraph--facet_explorer":
      return new ParagraphFacetExplorer(incoming);
    case "paragraph--items_from_an_entityqueue":
      return new ParagraphEntityQueueTiles(incoming);
    case "paragraph--media_tiles":
      return new ParagraphMediaTiles(incoming);
    case "paragraph--people":
      return new ParagraphPeople(incoming);
    case "paragraph--podcast_episode":
      return new ParagraphPodcastEpisode(incoming);
    case "paragraph--program_day":
      return new ParagraphProgramDay(incoming);
    case "paragraph--pull_quote":
      return new ParagraphPullQuote(incoming);
    case "paragraph--slide":
      return new ParagraphSlide(incoming);
    case "paragraph--slide_tiles":
      return new ParagraphSlideTiles(incoming);
    case "paragraph--stats":
      return new ParagraphStats(incoming);
    case "paragraph--tiles_social":
      return new ParagraphTilesSocial(incoming);
    case "paragraph--tiles_sponsors":
      return new ParagraphTilesSponsors(incoming);

    default:
      console.error("Cannot determine Data Class", incoming);
      throw new Error("Cannot Determine Data Class for ".concat(incoming.type));
  }
};

export default ParagraphDataFactory;
