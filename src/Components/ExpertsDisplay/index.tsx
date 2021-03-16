import React, { useState } from 'react';
import ExpertSort from './ExpertSort';
import CENTERSANDGROUPS from './Centersandgroups';
import TOPICS from './Topics';
import Person from './Person';
import { useEffect } from 'react';
import { Col, Row } from "react-bootstrap";
import styled from "styled-components";
var example = require('./example.json');

const FilterArea = styled.div`
  & .filter-area{
    @media screen and (max-width: 768px) {
      display:none;
    }

    @media screen and (min-width: 768px) {
      display:block !important;
    }
  }
`;
const ExpertsDisplay = () => {
  const [filters_centerAndGroups, setfilters_centerAndGroups] = useState([]);
  const [filters_topics, setfilters_topics] = useState([]);
  const [experts, setExperts] = useState([]);
  const [selectedCenterAndGroups, setSelectedCenterAndGroups] = useState([]);
  const [selectedTopics, setSelectedTopics] = useState([]);

  useEffect(() => {
    var CentersAndGroups = [];
    var Topics = [];
    example.forEach(element => {
      element.departments.forEach(departments => {
        CentersAndGroups.push(departments.trim());
      });
      element.tags.forEach(tags => {
        Topics.push(tags.trim());
      });
    });
    setfilters_centerAndGroups(getFilters(CentersAndGroups));
    setfilters_topics(getFilters(Topics));
    setExperts(example);
  }, []);
  function getFilters(example){
    var result = [];
    let counts = {}

    for(let i =0; i < example.length; i++){ 
      if (counts[example[i]]){
      counts[example[i]] += 1
      } else {
      counts[example[i]] = 1
      }
    }  
    for (let prop in counts){
      if (counts[prop] >= 1){
        result.push(prop + ":" + counts[prop]);
      }
    }
    return result;
  }
  const filterDataForCenterAndGroups = (centerandgroups) => {
    var filtered_data = [];
    setSelectedCenterAndGroups(centerandgroups);
    if(centerandgroups.length > 0){
      example.forEach(element => {
        var existed = false;
        var departments_str = element.departments.join(":");
        var BreakException= {};
        try {
          centerandgroups.forEach(function(centerandgroup) {
            if(departments_str.includes(centerandgroup)) {
              existed = true;
              filtered_data.push(element);
              throw BreakException;
            }
          });
        } catch(e) {
          if (e!==BreakException) throw e;
        }
      });      
    } else{
      filtered_data = example;
    }
    setExperts(filtered_data);
  }
  const filterDataForTopics = (topics) => {
    var filtered_data = [];
    setSelectedTopics(topics);
    if(topics.length > 0){
      example.forEach(element => {
        var existed = false;
        var tags_str = element.tags.join(":");
        var BreakException= {};
        try {
          topics.forEach(function(topic) {
            if(tags_str.includes(topic)) {
              existed = true;
              filtered_data.push(element);
              throw BreakException;
            }
          });
        } catch(e) {
          if (e!==BreakException) throw e;
        }
      });      
    } else{
      filtered_data = example;
    }
    setExperts(filtered_data);
  }
  return (
    <div className="margin-bottom-40 margin-top-10">
      <ExpertSort />
      <FilterArea>
        <Row>
            <Col className="sidebar filter-area" md={3} sm={12}>
              <CENTERSANDGROUPS filters_centerAndGroups={ filters_centerAndGroups } resetExpert={filterDataForCenterAndGroups} selectedCenterAndGroups={selectedCenterAndGroups}/>
              <TOPICS filters_topics={ filters_topics } resetExpert={filterDataForTopics} selectedTopics={selectedTopics}/>
            </Col>
            <Col md={9} sm={12}>
              <Person experts={experts}/>
            </Col>
        </Row>
      </FilterArea>

    </div>
  )
};
export default ExpertsDisplay;