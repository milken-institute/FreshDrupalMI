
import ColorObject from './ColorObject';
import { ImageObject } from './ImageObject';

interface SlideKeyValueText {
  key: string;
  description: string;
  value: string;
  format: string;
  processed: string;
}

interface SlideDataInterface {
  loaded: boolean;
  type: string;
  id: string;
  links: object;
  drupal_internal__id: number;
  langcode: string;
  title: string;
  created: string;
  changed: string;
  default_langcode: boolean;
  metatag: null;
  field_background_color: ColorObject;
  field_link: null,
  field_promoted: false,
  field_published: true,
  field_text_color: ColorObject,
  slide_type: object,
  field_background_image: ImageObject,
  field_slide_text: Array<SlideKeyValueText>
}


export default SlideDataInterface;
