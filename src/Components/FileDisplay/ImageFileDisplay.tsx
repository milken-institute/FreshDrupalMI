import React, { useState } from "react";
import Loading from "../Loading";
import ImageFile, { ImageFileInterface } from "../../DataTypes/ImageFile";
import { EntityComponentProps } from "../../DataTypes/EntityComponentProps";
import Holder from "react-holder-component";

interface ImageFileDisplayProps {
  data: ImageFileInterface;
  view_mode: string;
  key?: number;
  style: Record<string, any>;
  width?: string;
  height?: string;
}

const ImageFileDisplay: React.FunctionComponent = (
  props: ImageFileDisplayProps
) => {
  const { data, view_mode, key, style, width, height } = props;
  const attributes = {
    width: width ?? "100%",
    height: height ?? "200px,",
  };

  if (!data?.id) {
    return (
      <>
        <Holder updateOnResize={"true"} {...attributes} />
      </>
    );
  }
  if (style) {
    attributes["style"] = style;
  }
  const DataObject = new ImageFile(data);
  // TODO: swap this out on View_mode change
  const imageTagStyle = style ?? {
    maxWidth: "320px",
    maxHeight: "200px",
  };
  const [imageData, setImageData] = useState(DataObject);
  console.debug("ImageFileDisplay:", imageData);
  if (!imageData?.hasData()) {
    const ecp = new EntityComponentProps(imageData);
    ecp
      .getData(imageData.getIncluded())
      .then((res) => res.json())
      .then((ajaxData) => {
        console.debug("MilkenImage: Data back from JSON", ajaxData);
        setImageData(new ImageFile(ajaxData.data));
      });
    return (
      <>
        <Loading />
      </>
    );
  } else {
    const imageStyleObject = imageData.imageStyleObject;
    return (
      <>
        <img
          data-drupal-id={imageData.id}
          data-drupal-type={imageData.type}
          data-uuid={imageData.id}
          {...imageStyleObject.imageAttributes}
          style={imageTagStyle}
        />
      </>
    );
  }
};

export { ImageFileDisplay as default, ImageFileDisplayProps };