import ImageFile, { ImageFileInterface } from "./ImageFile";

import ImageStyleObject, {
  ImageStyleObjectInterface,
  HolderImageStyleObject,
} from "./ImageStyleObject";
import Media, { MediaInterface } from "./Media";

interface MediaImageInterface extends MediaInterface {
  field_media_image?: ImageFileInterface;
  field_photo_subject_name?: string;
  field_photo_subject_title?: string;
  field_photo_subject_org?: string;
}

class MediaImage extends Media implements MediaImageInterface {
  field_media_in_library?: boolean;
  field_photo_subject_name?: string;
  field_photo_subject_title?: string;
  field_photo_subject_org?: string;

  protected _thumbnail?: ImageFile;
  protected _field_media_image?: ImageFile;

  constructor(props) {
    super(props);
    Object.assign(this, props);
    if (props.thumbnail !== undefined && this.thumbnail === undefined) {
      this._thumbnail = new ImageFile(props.thumbnail);
    }
    if (
      props._field_media_image !== undefined &&
      this._field_media_image === undefined
    ) {
      this._field_media_image = new ImageFile(props._field_media_image);
    }
  }

  getIncluded(): string {
    return "&include=field_media_image,thumbnail";
  }

  hasData(): boolean {
    return this.status !== undefined;
  }

  get field_media_image(): ImageFileInterface {
    return this._field_media_image;
  }

  set field_media_image(incoming: ImageFileInterface) {
    this._field_media_image = new ImageFile(incoming);
  }

  get thumbnail(): ImageFileInterface {
    return this._thumbnail;
  }

  set thumbnail(incoming: ImageFileInterface) {
    this._thumbnail = new ImageFile(incoming);
  }

  getThumbnail() {
    return this.thumbnail;
  }
}

export { MediaImage as default, MediaImageInterface };
