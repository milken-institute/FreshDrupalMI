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
            height: 10.3vw;
            min-height: 198px;
        }        
    }
    & .speaker-detail > div{
        padding-left:15px;
    }
    & .external{
        padding: 10px;
        color:#E02222;
    }
    & .speaker-detail .field-tag-speaker{
        margin-top: 16px;
        text-transform: uppercase;
        color: #0065cc;
        font-size: 1.1em;
        margin-bottom: 9px;
        line-height: 18px;
    }
    & .filter-sidebar-1{
        border: 1px solid #b9b9b9;
    }
    & .newsroom-title{
        margin-bottom: 10px;
        line-height: 22px;
        font-size: 23px;
        color: #35363c;
        display: -webkit-box;
        text-overflow: ellipsis;
        overflow: hidden;
        -webkit-line-clamp: 1;
        -webkit-box-orient: vertical;
    }
    & .description {
        height: 80px;
    }
    & .description i{
        line-height: 22px;
        display: -webkit-box;
        max-width: 100%;
        height: auto;
        -webkit-line-clamp: 3;
        -webkit-box-orient: vertical;
        overflow: hidden;
        text-overflow: ellipsis;
        font-size: 16px;
    }
    & .date-featured{
        font-size: 20px;
    }
`;

const Person = ({newsrooms}) => {

    return (
        <div>
            {newsrooms.map((newsroom, index) => (
                <PersonWrapper key={index}>
                    <div className="form-group filter-sidebar-1">
                        <Row>
                            <Col className="speaker-detail text-left" lg={9} md={9} sm={12}>
                                <div>
                                    <div className="field-tag-speaker font-weight-bold">
                                        <span>{newsroom.type.join(" - ")}</span>
                                    </div>
                                    <a href={newsroom.link_uri} className="newsroom-title font-weight-bold">{newsroom.title}</a>
                                    <div className="description">
                                        <i>{newsroom.description}</i>
                                    </div>
                                    <h6 className="date-featured">
                                        {newsroom.publish_date}
                                        <a className="external pull-right" href={newsroom.link_uri}>
                                            {newsroom.link_text}                      
                                        </a>
                                    </h6>
                                </div>
                            </Col>
                            <Col className="img-bkg-detail" lg={3} md={3} sm={12}>
                                <img src={newsroom.image}></img>
                            </Col>                        
                        </Row>

                    </div>                    
                </PersonWrapper>
            ))}
        </div>
    )
};
export default Person;