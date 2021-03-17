import React, { useState } from "react";
import DataTypePeopleFactory from '../../DataTypes/People/Factory'
import EntityComponentProps from "../../DataTypes/EntityComponentProps";
import { SocialMediaLinkInterface } from "../../Fields/SocialMediaLink";
import ImageFileDisplay from "../FileDisplay/ImageFileDisplay";
import { PeopleInterface } from "../../DataTypes/People";
import { Row, Col } from "react-bootstrap";
import styled from "styled-components";
import moment from "moment";
import { TagsDisplay } from "../TagsDisplay"
import { SocialDisplay } from "../SocialDisplay"
import Loading from "../Loading";

export interface PeopleDisplayProps {
  data: PeopleInterface;
  key?: string;
  view_mode: string;
}

// TODO: support more than one bundle of people. Currently only supports "staff".
export const PeopleDisplay = (props: PeopleDisplayProps) => {
  const { data, key, view_mode } = props;
  const DataObject = DataTypePeopleFactory(data);
  const [staffData, setStaffData] = useState(DataObject);
  const [fetchRan, setFetchData] = useState(false);

  if (!staffData.hasData() || !fetchRan) {
    const ecp = new EntityComponentProps(DataObject);
    ecp
      .getData(DataObject.getIncluded())
      .then((res) => res.json())
      .then((ajaxData) => {
        const newDO = DataTypePeopleFactory(ajaxData.data);
        setStaffData(newDO);
        setFetchData(true);
      });
  }

  if (!staffData.hasData()) {
    return <Loading />;
  }

  console.debug("PeopleDisplay: staffData.hasData()", staffData.hasData());

  console.debug("PeopleDisplay: Component should have data by now:", staffData);
  switch (view_mode) {
    case 'card':
      return (
        <a
          className="col-sm-6 col-md-4 col-lg-3 p-4 text-center text-decoration-none text-dark"
          style={{ fontSize: '0.75em', transition: 'all 0.5s ease' }}
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
          <p style={{ color: 'dimgray' }}>{staffData.field_pgtitle}</p>
        </a>
      );

    default:

      const PersonElMainWrapper = styled.div`
      `;

      const HeroWrapper = styled.div`
        background: #0065CC;
        width: 100%;
        & .nameTitle {
          display: flex;
          align-items: center;
          justify-content: center;
        }

        @media only screen and (max-width: 767.98px) {
          padding-top: 55.25%;
        }
      `;

      const ElMainContentWrapper = styled.div`
        & .section-social {
          order: 1;
        }
        & .section-content {
          order: 2;
          @media only screen and (max-width: 1199.98px) {
            order: 3;
            padding-top: 1.5em;
    
          }
        }
        & .section-tags {
          order: 3;
          @media only screen and (max-width: 1199.98px) {
            order: 2;
          }
        }
      `;

      const NameTitle = styled.div`
        color: white;
        width: 450px;
        margin-left: 220px;

        & h1 {
          font-family: 'LatoWebBlack';
          font-size: 2.75rem;
          font-weight: bold;
          margin-bottom: 20px;
          
        }
        
        & h5 {
          font-size: 1.8rem;
        }
      `;

      return (
        <PersonElMainWrapper className="container-fluid p-0">
          <Row className="no-gutters">
            <Col>
              <HeroWrapper>
                <Row>
                  <Col lg="6" className="nameTitle">
                    <NameTitle>
                      <a href="#" onClick={() => { history.back() }}>&lt; Back to previous page</a>
                      <h1>{staffData.field_first_name} {staffData.field_last_name}</h1>
                      <h5>{staffData.field_pgtitle}</h5>
                    </NameTitle>
                  </Col>
                  <Col lg="6">
                    <img src="https://milkeninstitute.org/sites/default/files/Hunter%2C%20John%20%281%29.jpg" />
                  </Col>
                </Row>
              </HeroWrapper>
            </Col>
          </Row>
          <Row>
            <ElMainContentWrapper className="container-fluid" style={{ width: "90%", margin: "2em auto" }}>
              <Row>
                <Col xs="12" lg="6" xl="1" className="section-social">
                  <SocialDisplay data={{ "name": data.name }}></SocialDisplay>
                </Col>
                <Col xs="12" xl="8" className="section-content">
                  <h1>People Display</h1>
                  <h5>field_biotext</h5>
                  <p>{staffData.field_biotext}</p>
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
                  {staffData?.field_photo[0]?.uri?.url}
                </Col>
                <Col xs="12" lg="6" xl="3" className="section-tags">
                </Col>
              </Row>
            </ElMainContentWrapper>
          </Row>
        </PersonElMainWrapper>
      );
  }
};

export default PeopleDisplay;