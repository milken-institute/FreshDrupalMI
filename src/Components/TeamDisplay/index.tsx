import React, {useEffect, useState} from 'react';
import PersonCardDisplay from './PersonCardDisplay';
import { Col, Row, Container } from "react-bootstrap";

var example = require('./example.json');

const TeamDisplay = () => {
  const [data, setData] = useState([]);
  useEffect(() => {
    setData(sort_group(example));
  }, []);
  function sort_group(res){
    res.forEach(element => {
      if(element.last_name_goes_first){
        element.sort_name = element.first_name;
      } else{
        element.sort_name = element.last_name;
      }
    });
    res.sort(function(a, b){
      if(a.sort_name < b.sort_name) { return -1; }
      if(a.sort_name > b.sort_name) { return 1; }
      return 0;
    });
    let data = res.reduce((r, e) => {
      let group = e.sort_name[0];
      if(!r[group]) r[group] = {group, children: [e]}
      else r[group].children.push(e);
      return r;
    }, {})
  
    let result = Object.values(data)
    return result;
  }
  return (
    data.map((team, index) => (
      <div className={"pt-4"} key={index}>
        <div className="section">
          <Container>
            <h1>{team.group}</h1>
          </Container>
        </div>
        <Container>
          <Row>
            {team.children.map((person, index1) => (
              <Col lg={3} md={4} sm={6} xs={12} key={index1}>
                <PersonCardDisplay team={person}/>
              </Col>
            ))}
          </Row>
        </Container>
      </div>
    ))
  )
};
export default TeamDisplay;