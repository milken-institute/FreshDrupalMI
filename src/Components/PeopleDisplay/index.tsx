import React, { useState } from "react";
import DataTypePeopleFactory from '../../DataTypes/People/Factory'
import EntityComponentProps from "../../DataTypes/EntityComponentProps";
import { SocialMediaLinkInterface } from "../../Fields/SocialMediaLink";
import ImageFileDisplay from "../FileDisplay/ImageFileDisplay";
import {PeopleInterface} from "../../DataTypes/People";

export interface PeopleDisplayProps {
  data: PeopleInterface;
  key?: string;
  view_mode: string;
}

// TODO: support more than one bundle of people. Currently only supports "staff".
export const PeopleDisplay = (props: PeopleDisplayProps) => {
  const { data, key, view_mode } = props;
  const DataObject = DataTypePeopleFactory(data);
  const [staffData, staffSetData] = useState(DataObject);
  if (!DataObject.hasData()) {
    const ecp = new EntityComponentProps(DataObject);
    ecp
      .getData(DataObject.getIncluded())
      .then((res) => res.json())
      .then((ajaxData) => {
        const newDO = DataTypePeopleFactory(ajaxData.data);
        staffSetData(newDO);
      });
  }
  console.debug("PeopleDisplay: Component should have data by now:", staffData);
  switch(view_mode) {
    case 'card':
      return (
        <a 
          className="col-sm-6 col-md-4 col-lg-3 p-4 text-center text-decoration-none text-dark" 
          style={{fontSize: '0.75em', transition: 'all 0.5s ease'}}
          href={staffData.path.alias}
        >
          <ImageFileDisplay
            data={staffData.field_photo[0]}
            view_mode="large"
            className={"card-img"}
            style={{ maxWidth: "100%" }}
            srcsetSizes="(max-width: 1000px) 200px, 400px"
          />
          <p className="font-weight-bold m-0 mt-3">{staffData.field_first_name} {staffData.field_last_name}</p>
          <p style={{color: 'dimgray'}}>{staffData.field_pgtitle}</p>
        </a>
      );

    default:
      return (
        <div>
          <h1>People Display</h1>
          <h5>field_biotext</h5>
          <p>{staffData.field_biotext}</p>
          <h5>field_email</h5>
          <p>{staffData.field_email}</p>
          <h5>field_first_name</h5>
          <p>{staffData.field_first_name}</p>
          <h5>field_pgtitle</h5>
          <p>{staffData.field_pgtitle}</p>
          <h5>field_social_media</h5>
          {/* <p>
            {staffData.field_social_media?.length
              ? staffData.field_social_media.map(
                  (item: SocialMediaLinkInterface, key: number) => {
                    return (
                      <div key={key}>
                        <h5>
                          Network:
                          {item.key}
                        </h5>
                        <p>
                          Hande:
                          {item.value}
                        </p>
                      </div>
                    );
                  }
                )
              : "Field has no value"}
          </p> */}
          <h5>Field Event</h5>
          {/* <p>{staffData.field_event}</p> */}
          <h5>Field Photo</h5>
          <p>
            {/* <ImageFileDisplay data={staffData.field_photo} view_mode="thumbnail" /> */}
          </p>
        </div>
      );
  }
};

export default PeopleDisplay;