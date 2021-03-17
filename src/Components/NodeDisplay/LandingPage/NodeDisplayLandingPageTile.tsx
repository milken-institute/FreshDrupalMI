import React from "react";
import { Card } from "react-bootstrap";
import styled from "styled-components";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowRight } from "@fortawesome/free-solid-svg-icons";
import ErrorBoundary from "Utility/ErrorBoundary";
import MediaDisplayImage from "Components/MediaDisplay/MediaDisplayImage";
import NodeLandingPage from "DataTypes/NodeLandingPage";

const CardOuter = styled.a`
  margin: 1em;
  width: 100%;
  cursor: pointer;
  text-decoration: none;

  &:hover {
    box-shadow: 0 8px 16px 0 grey;
    text-decoration: none;
  }
  &:hover .card-title {
    color: var(--color-milken-orange) !important;
  }
  &:hover .card-body div {
    display: unset;
  }

  @media (max-width: 767px) {
    margin: 1em 0;
  }
  @media (min-width: 768px) {
    width: 17em;
  }
  @media (min-width: 1200px) {
    width: 20em;
  }
`;

const CardLinkBox = styled.div`
  display: none;
  position: absolute;
  bottom: 0px;
  left: 0px;
  width: 100%;
  border-bottom: 4px solid var(--color-milken-orange);
`;

const onClickHandler = (evt) => {
  console.debug("onClickHandler", evt);
  document.location.href = evt.currentTarget.dataset.alias;
};

export interface NodeDisplayLandingPageTileProps {
  data: NodeLandingPage;
  key: number;
}

export const NodeDisplayLandingPageTile = (
  props: NodeDisplayLandingPageTileProps
) => {
  const { data, key } = props;
  return (
    <CardOuter
      // onClick={onClickHandler}
      // data-alias={data.path.alias}
      href={data.path.alias !== null ? data.path.alias : '/node/' + data.drupal_internal__nid}
      key={key}
      className="card border-0"
    >
      <Card.Title
        className="text-center text-uppercase py-3 mb-0 border"
        style={{ fontSize: "1.0em", color: "var(--color-milken-blue)" }}
      >
        {data.title}
      </Card.Title>
      <Card.Body style={{ padding: 0 }}>
        <ErrorBoundary>
          <MediaDisplayImage
            data={data.field_hero_image}
            view_mode={"thumbnail"}
          />
        </ErrorBoundary>
        <CardLinkBox>
          <FontAwesomeIcon
            icon={faArrowRight}
            style={{
              float: "right",
              color: "white",
              backgroundColor: "var(--color-milken-orange)",
              padding: ".5em",
              width: "3em",
              height: "3em",
            }}
          />
        </CardLinkBox>
      </Card.Body>
    </CardOuter>
  );
};

export default NodeDisplayLandingPageTile;
