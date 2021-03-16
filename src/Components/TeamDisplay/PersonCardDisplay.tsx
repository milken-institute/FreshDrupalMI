import React from 'react';
import { Image } from "react-bootstrap";
import styled from "styled-components";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faLinkedin,
    faYoutube,
    faFacebook,
    faTwitter,
    faInstagram
  } from '@fortawesome/free-brands-svg-icons';

const PersonWrapper = styled.div`
    & .job-title{
        font-size: 16px;
    }
    padding:7px;
    background:rgb(238, 240, 248);
    box-shadow:0 0 30px 0 rgba(82,63,105,.05);
    border-radius:5px;
    & .person-detail{
        min-height: 520px;
        position:relative;
    }
    & .social-group span{
        font-size: 25px;
        color: #1153a7;
        padding: 4px 5px 4px 4px;
        width: 35px;
        display: inline-block;
    }
    & .social-group{
        margin: 20px 0px;
    }
    & .read-more{
        font-size: 20px;
        padding: 5px 0px;
        color: white;
        position: absolute;
        width: 100%;
        background: #0066cc;
        bottom: 0px;
    }
`;

const PersonCardDisplay = ({team}) => {

    return (
        <PersonWrapper className="text-center mb-4">
            <div className="person-detail">
                <a href={team.link_uri}>
                    <Image src={team.image} fluid className={'mb-4'}/>
                    <h3>{ (team.last_name_goes_first) ? team.last_name + ' ' + team.first_name : team.first_name + ' ' + team.last_name }</h3>
                </a>
                <label className="job-title">{team.job_title}</label>
                <div className="social-group">
                    {(team.social_media.facebook) ? <span><FontAwesomeIcon icon={faFacebook} /></span> : ""}
                    {(team.social_media.linkedin) ? <span><FontAwesomeIcon icon={faLinkedin} /></span> : ""}
                    {(team.social_media.twitter) ? <span><FontAwesomeIcon icon={faTwitter} /></span> : ""}
                    {(team.social_media.instagram) ? <span><FontAwesomeIcon icon={faInstagram} /></span> : ""}
                    {(team.social_media.youtube) ? <span><FontAwesomeIcon icon={faYoutube} /></span> : ""}
                </div>
                {(team.link_text != "") ? <div className="read-more">Read More</div> : ""}
            </div>
        </PersonWrapper>
    )
};
export default PersonCardDisplay;