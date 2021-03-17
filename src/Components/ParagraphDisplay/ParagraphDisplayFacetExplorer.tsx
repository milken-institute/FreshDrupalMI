import React, {useState} from "react";
import { Col, Row, Container } from "react-bootstrap";
import * as DataObject from "../../DataTypes/ParagraphFacetExplorer";
import styled from "styled-components";
import {DrupalJsonApiParams} from 'drupal-jsonapi-params';
import Staff from "../../DataTypes/People/Staff";
import NodeArticle from "../../DataTypes/NodeArticle";
import ListDisplay from "../ListDisplay";
import { Collapse } from "react-bootstrap";
import Select from "react-select";
import ReactPaginate  from 'react-paginate';


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
  const [pageCount, setPageCount] = useState(1);
  const [pageItemOffset, setPageItemOffset] = useState(0);
  const [filterTopics, setFilterTopics] = useState([]);
  const [filterCenters, setFilterCenters] = useState([]);

  const filterCollections = data.field_collections?.data !== null ? data.field_collections?.name : null;
  const filterTeams = data.field_teams?.data !== null ? data.field_teams?.name : null;

  const apiParams = new DrupalJsonApiParams();

  let ContentListObject = [];
  let TopicsListObject = [];
  let CentersListObject = [];
  let requestURL = '';
  let resultsCount = null;
  let field_items_per_page = 2
  // Build request URL and URL parameters
  switch(data.field_facet_content_type){
    case 'article':
      apiParams.addSort('created');
      apiParams.addPageLimit(field_items_per_page); // Later, change to data.field_items_per_page
          
        if( filterCollections !== null ) {
          apiParams.addFilter('field_collections.name', filterCollections);
        }

        if( filterTeams !== null ) {
          apiParams.addFilter('field_teams.name', filterTeams);
        }

        // Use this to show content tagged with selected Topics
        if ( filterTopics !== null && filterTopics.length > 0 ) {
        // if ( "Include only selected Topics" && false ) {
          // apiParams.addFilter('field_topics.name', ['Array Of','Topics'], 'IN');
          apiParams.addFilter('field_topics.name', filterTopics, 'IN');
        }

        // Use this to show content tagged with selected Centers
        // if ( "Include only selected Centers" && false ) {
        if ( filterCenters !== null && filterCenters.length > 0 ) {
          apiParams.addFilter('field_centers.name', filterCenters, 'IN');
        }
        
        // Use this to sort by title
        if ( "sort by title" && false) {
          apiParams.addSort('title');
        }

        // Use pageItemOffset for pagination, it skips a number of records. meta.count has the total number
        requestURL = '/jsonapi/node/article?jsonapi_include=true&' 
          + apiParams.getQueryString();
          
        if (pageItemOffset !== null) {
          requestURL += '&page[offset]=' + pageItemOffset?.toString();
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
      setPageCount(Math.ceil(resultsCount/field_items_per_page));
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
      });
    }
  }

  const handlePageClick = (page) => {
    setPageItemOffset(page.selected * field_items_per_page);
    console.debug("ParagraphDisplayFacetExplorer pageItemOffset", pageItemOffset);
    console.debug("ParagraphDisplayFacetExplorer page.selected", page.selected);
    setFetchRan(false);
  }

  const selectTopics = (t) => {
    setFilterTopics(t);
    setFetchRan(false);
  }

  const selectCenters = (t) => {
    setFilterCenters(t);
    setFetchRan(false);
  }

  const FacetExplorerContainer = styled.div`
    & .filter-area {
      margin-bottom:30px;
    }
    & .sidebar-content {
      padding:0px 20px;
    }
    & .sidebar-content p {
      color: #999;
      font-size: 14px;
      font-weight: bold;
    }
    & .sidebar-content h5 {
      font-size: 20px;
      font-weight: bold;
    }
    & .sidebar-content h6 {
      color: #999;
      font-size: 14px;
    }
  `;

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
  
  // const Pagination = styled.div`
  //   & .pagination {
  //     display: flex;
  //     padding-left: 0;
  //     list-style: none;
  //   }
  //   & .pagination > li {
  //     display: inline;
  //   }
  //   & .pagination>li>a {
  //     position: relative;
  //     float: left;
  //     padding: 6px 12px;
  //     line-height: 1.42857143;
  //     border: 1px solid #ddd;
  //   }
  //   & .pagination .active > a, & .pagination .active > a:hover {
  //     background: #eee;
  //     border-color: #dddddd;
  //   }
  // `;

  return (
    <div>
      <FacetExplorerContainer className="container-fluid py-5">
        <Row>
          <Col lg={3}>
            <div className="filter-area">
              <CustomSelect>
                <Select
                  isMulti
                  closeMenuOnSelect={false}
                  defaultValue={filterTopics}
                  placeholder={"Topics"}
                  options={topicsList}
                  getOptionLabel={({ label }) => label}
                  getOptionValue={({ value }) => value}
                  onChange={selectTopics}
                  // onChange={(t) => setFilterParameter("topics", t)}
                  // keys={filterState.topics}
                />
              </CustomSelect>
            </div>
            <div className="filter-area">
              <CustomSelect>
                <Select
                  isMulti
                  closeMenuOnSelect={false}
                  defaultValue={filterCenters}
                  placeholder={"Centers"}
                  options={centersList}
                  getOptionLabel={({ label }) => label}
                  getOptionValue={({ value }) => value}
                  onChange={selectCenters}
                //  onChange={(t) => setFilterParameter("topics", t)}
                //  keys={filterState.topics}
                />
              </CustomSelect>
            </div>
            <div className="filter-area sidebar-content">
              <div dangerouslySetInnerHTML={{__html: data.field_sidebar_content?.value}} />
            </div>
          </Col>
          <Col lg={9}>

            <Row>
              <ListDisplay
                id={"content-list-".concat(data.id)}
                list={contentList}
                view_mode={data.field_view_mode}
              />
            </Row>
            {/* <Row>
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
            </Row> */}
            <Row>
              {requestURL}
            </Row> 
          </Col>
        </Row>
      </FacetExplorerContainer>
      <Row>
        <Col lg={3}></Col>
        <Col lg={9}>
          <div className="newsroom-paginate">
            <ReactPaginate
                previousLabel={'Previous'}
                nextLabel={'Next'}
                breakLabel={'...'}
                breakClassName={'break-me'}
                pageCount={pageCount}
                marginPagesDisplayed={2}
                pageRangeDisplayed={field_items_per_page}
                onPageChange={handlePageClick}
                containerClassName={'pagination'}
                subContainerClassName={'pages pagination'}
                activeClassName={'active'}
              />               
          </div>
            
        </Col>
      </Row>      
    </div>

  );
};

export { ParagraphDisplayFacetExplorer as default, ParagraphDisplayFacetExplorerProps };
