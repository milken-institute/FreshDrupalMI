import React, {useState} from "react";
import { Col, Row, Container } from "react-bootstrap";
import * as DataObject from "../../DataTypes/ParagraphStats";
import styled from "styled-components";
import {DrupalJsonApiParams} from 'drupal-jsonapi-params';
import Staff from "../../DataTypes/People/Staff";
import NodeArticle from "../../DataTypes/NodeArticle";
import ListDisplay from "../ListDisplay";
import { Collapse } from "react-bootstrap";
import Select from "react-select";


interface ParagraphDisplayFacetExplorerProps {
  data: DataObject.default;
  view_mode: string;
}

const ParagraphDisplayFacetExplorer: React.FunctionComponent = (
  props: ParagraphDisplayFacetExplorerProps
) => {
  const { data } = props;

  console.debug("ParagraphDisplayFacetExplorer: Data from Props ", data);

  const [fetchRan, setFetchRan] = useState(false);
  const [contentList, setContentList] = useState(null);
  const [topicsList, setTopicsList] = useState(null);
  const [centersList, setCentersList] = useState(null);

  const filterCollections = data.field_collections?.data !== null ? data.field_collections?.name : null;
  const filterTeams = data.field_teams?.data !== null ? data.field_teams?.name : null;

  const apiParams = new DrupalJsonApiParams();

  let ContentListObject = [];
  let TopicsListObject = [];
  let CentersListObject = [];
  let requestURL = '';
  let pageOffset = null;
  let resultsCount = null;

  // Build request URL and URL parameters
  switch(data.field_facet_content_type){
    case 'article':
      apiParams.addSort('created');
      apiParams.addPageLimit(2); // Later, change to data.field_items_per_page
          
        if( filterCollections !== null ) {
          apiParams.addFilter('field_collections.name', filterCollections);
        }

        if( filterTeams !== null ) {
          apiParams.addFilter('field_teams.name', filterTeams);
        }

        // Use this to show content tagged with selected Topics
        if ( "Include only selected Topics" && false ) {
          apiParams.addFilter('field_topics.name', ['Array Of','Topics'], 'IN');
        }

        // Use this to show content tagged with selected Centers
        if ( "Include only selected Centers" && false ) {
          apiParams.addFilter('field_centers.name', ['Array Of','Centers'], 'IN');
        }
        
        // Use this to sort by title
        if ( "sort by title" && false) {
          apiParams.addSort('title');
        }

        // Use pageOffset for pagination, it skips a number of records. meta.count has the total number
        requestURL = '/jsonapi/node/article?jsonapi_include=true&' 
          + apiParams.getQueryString();
          
        if (pageOffset !== null && pageOffset > 0) {
          requestURL += '&page[offset]=' + pageOffset?.toString;
        }

        console.debug("ParagraphDisplayFacetExplorer: requestURL ", requestURL);
      break;
      
    default:
      console.error("No content type specified for Facet Explorer");
      throw new Error("No content type specified for Facet Explorer");
  }

  // Fetch Content and Taxonomy Tag Lists
  if(!fetchRan) {
    setFetchRan(true);

    // Fetch Main Content 
    fetch(requestURL)
    .then((res) => res.json())
    .then((incoming) => {
      resultsCount = incoming.meta.count;
      incoming.data.map(
        contentItem => {
          if( data.field_facet_content_type === 'article' ) {
            ContentListObject.push(new NodeArticle(contentItem));
          }
          if( data.field_facet_content_type === 'staff' ) {
            ContentListObject.push(new Staff(contentItem));
          }
        }
      )
      setContentList(ContentListObject);
      console.debug("ParagraphDisplayFacetExplorer: contentList ", contentList);
    });
    
    // Fetch List of Topics for filter list
    if(topicsList === null){
      fetch('/jsonapi/taxonomy_term/topics?jsonapi_include=true')
      .then((res) => res.json())
      .then((incoming) => {
        incoming.data.map(
          contentItem => {
            TopicsListObject.push({ value: contentItem.name, label: contentItem.name });
          }
        )
        setTopicsList(TopicsListObject);
        console.debug("ParagraphDisplayFacetExplorer: topicsList ", topicsList);
      });
    }
    
    // Fetch List of Centers for filter list
    if(centersList === null){
      fetch('/jsonapi/taxonomy_term/centers?jsonapi_include=true')
      .then((res) => res.json())
      .then((incoming) => {
        incoming.data.map(
          contentItem => {
            CentersListObject.push({ value: contentItem.name, label: contentItem.name });
          }
        )
        setCentersList(CentersListObject);
        console.debug("ParagraphDisplayFacetExplorer: centersList ", centersList);
      });
    }
  }



  const FacetExplorerContainer = styled.div``;

  const CustomSelect = styled.div`
  [class$="-control"] {
    border-radius: 0;
    border-color: lightgray;
  }
  .custom-select {
    border-radius: 0;
    border-color: lightgray;
  }
`;

  return (
    <FacetExplorerContainer className="container-fluid py-5">
      <Row>
        <Col lg={3} >
          <CustomSelect>
            <Select
              isMulti
              closeMenuOnSelect={false}
              placeholder={"Topics"}
              options={topicsList}
              getOptionLabel={({ label }) => label}
              getOptionValue={({ value }) => value}
            //  onChange={(t) => setFilterParameter("topics", t)}
            //  keys={filterState.topics}
            />
          </CustomSelect>
          <CustomSelect>
            <Select
              isMulti
              closeMenuOnSelect={false}
              placeholder={"Centers"}
              options={centersList}
              getOptionLabel={({ label }) => label}
              getOptionValue={({ value }) => value}
            //  onChange={(t) => setFilterParameter("topics", t)}
            //  keys={filterState.topics}
            />
          </CustomSelect>
        </Col>
        <Col lg={9}>
          <Row>
            {data.field_items_per_page}
          </Row>
          <Row>
            {data.field_facet_content_type}
          </Row>
          <Row>
            {filterCollections}
          </Row>
          <Row>
            {filterTeams}
          </Row>
          <Row>
            {requestURL}
          </Row>
          <Row>
            <ListDisplay
              id={"content-list-".concat(data.id)}
              list={contentList}
              view_mode={data.field_view_mode}
            />
          </Row>
        </Col>
      </Row>
      
    </FacetExplorerContainer>
  );
};

export { ParagraphDisplayFacetExplorer as default, ParagraphDisplayFacetExplorerProps };
