import React from 'react';
import $ from 'jquery';
import { Button } from 'react-bootstrap';
import styled from "styled-components";

const SortWrapper = styled.div`
    & .person-select{
        width:200px !important;
        float:right;
        @media screen and (max-width: 768px) {
            display:none;
        }
    }

    & > div{
        overflow:hidden;
    }
    & .toggle-filter-area{
        float:right;
        display:none;
        @media screen and (max-width: 768px) {
            display:block;
        }
    }
`;

const NewsRoomSort = () => {
    const handleFilterArea = () => {
        $(".filter-area").slideToggle();
    }
    return (
        <SortWrapper className={"expert-sort mb-2"}>
            <div>
                <select className="form-control pull-right person-select">
                    <option>Newest - Oldest</option>
                    <option>Oldest - Newest</option>
                </select>
            </div>
            <div>
                <Button className="toggle-filter-area" onClick={handleFilterArea}>Toggle</Button>
            </div>
        </SortWrapper>
    )
};
export default NewsRoomSort;