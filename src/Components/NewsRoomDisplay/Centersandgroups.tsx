import React, { useEffect } from 'react';
import 'icheck/skins/all.css';
import {Checkbox} from 'react-icheck';
import $ from 'jquery';
import styled from "styled-components";

const CentersAndGroupsWrapper = styled.div`
    border: 1px solid #b9b9b9;
    & .external{
        padding: 10px;
    }
    & .block-title{
        font-size: 17px;
    }
    & .filter{
        padding: 5px 10px;
        background: white;
        height: 45px;
    }
    & .external .setting{
        display:block;
    }
    & .filter table tr td:first-child{
        width: 15%;
    }
    & .filter table tr td:nth-child(2){
        width: 85%;
    }
    & table{
        width:100%;
        height:100%;
    }
    & .filter-desc label{
        font-size: 12px;
        color: #35363c;
        cursor: pointer;
    }
`;
const CENTERSANDGROUPS = ({filters_centerAndGroups, resetExpert, selectedCenterAndGroups}) => {
    useEffect(() => {
    }, []);
    const handleCheck = (e, checked) =>{
        $("td.topics .icheckbox_square-red").each(function(){
            if($(this).attr("class").includes("checked")){
                window.$(this).children("input").trigger("click");
            }
        });
        if(checked){
            selectedCenterAndGroups.push(e.target.value);
        } else{
            const index = selectedCenterAndGroups.indexOf(e.target.value);
            if (index > -1) {
                selectedCenterAndGroups.splice(index, 1);
            }
        }
        resetExpert(selectedCenterAndGroups);
    }

    return (
        <CentersAndGroupsWrapper className="form-group filter-sidebar-1">
            <div className="external">
                <h3 className="bold caption text-left block-title">CENTERS AND GROUPS</h3>
                <span className="setting text-left">
                    <a>Select all |</a>
                    <a> Reset</a>
                </span>
            </div>
            {filters_centerAndGroups.map((filter, index) => (
                <div className="text-left filter" key={index}>													
                    <table>
                        <tbody>
                            <tr>
                            <td className="centerandgroups">
                                <Checkbox
                                id={"centerandgroups" + index}
                                checkboxClass="icheckbox_square-red"
                                increaseArea="20%"
                                value={filter.split(":")[0]}
                                onChange = {handleCheck}
                                />
                            </td>
                            <td className="filter-desc"><label htmlFor={"centerandgroups" + index}>{filter.split(":")[0]} ({filter.split(":")[1]})</label></td>
                            </tr>    
                        </tbody>
                    </table>     
                </div>                
            ))}
        </CentersAndGroupsWrapper>
    )
};
export default CENTERSANDGROUPS;