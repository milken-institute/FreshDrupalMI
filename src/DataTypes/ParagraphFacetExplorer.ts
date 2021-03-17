import Paragraph, { ParagraphInterface } from './Paragraph';

export interface ParagraphFacetExplorerInterface extends ParagraphInterface {
  admin_title: string;
  field_facet_content_type: string;
  field_section_header: string;
  field_sidebar_content: string;
  field_collections: any;
  field_teams: any;
  field_items_per_page: string;
  field_view_mode: string;
}

export default class ParagraphFacetExplorer
  extends Paragraph
  implements ParagraphFacetExplorerInterface {

    admin_title: string;
    field_facet_content_type: string;
    field_section_header: string;
    field_sidebar_content: string;
    field_collections: any;
    field_teams: any;
    field_items_per_page: string;
    field_view_mode: string;

  constructor(incoming: ParagraphFacetExplorerInterface) {
    super(incoming);
    Object.assign(this, incoming);
  }

  getIncluded(): string {
    return "&include=field_collections,field_teams";
  }
}
