import React from 'react';
import { Col, Row } from "react-bootstrap";
import styled from "styled-components";

const PersonWrapper = styled.div`
    & .img-bkg-detail img{
        @media screen and (max-width: 768px) {
            width: 100%;
            min-height: -webkit-fill-available;  
        }

        @media screen and (min-width: 768px) {
            width: 100%;
            height: 10.7vw;
            min-height: 205px;
        }        
    }
    & .profile-link{
        color:#E02222;
        text-transform: uppercase;
        font-size: 13px;
    }
    & .field-tag-speaker{
        margin-top: 16px;
        text-transform: uppercase;
        color: #0065cc;
        font-size: 1.3em;
        margin-bottom: 9px;
        line-height: 18px;
    }
    & .filter-sidebar-1{
        border: 1px solid #b9b9b9;
    }
    & .position-job-speaker{
        color: #999aa3;
        font-family: 'Lato';
        font-size: 14px;
    }
    & .body ul{
        padding-left: 1.5em;
        margin-bottom: 10px;
        line-height: 20px;
        font-size: 14px;
    }
`;

const Person = ({experts}) => {

    return (
        <div>
            {experts.map((expert, index) => (
                <PersonWrapper key={index}>
                    <div className="form-group filter-sidebar-1">
                        <Row>
                            <Col lg={3} md={3} sm={12} className="img-bkg-detail">
                                <img src={expert.image} />
                            </Col>
                            <Col lg={9} md={9} sm={12} className="speaker-detail text-left">
                                <div className="field-tag-speaker font-weight-bold">
                                    <span>{expert.tags.join(" - ")}</span>
                                </div>
                                <h5 className="bold"> {expert.name} <span className="position-job-speaker">{expert.departments.join(" and ")}</span></h5>
                                <div className="body">
                                    <div dangerouslySetInnerHTML={{__html: expert.description}}></div>
                                    <a href={expert.link_uri} className="profile-link">{expert.link_text}</a>
                                </div>
                            </Col>                        
                        </Row>
                    </div>                    
                </PersonWrapper>

            ))}
        </div>
    )
};
export default Person;