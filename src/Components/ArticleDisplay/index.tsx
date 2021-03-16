import React from "react";
import * as DataObject from "../../DataTypes/NodeArticle";
import ArticleFull from "./ArticleFull";
import ArticleCard from "./ArticleCard";
import ArticleRow from "./ArticleRow";
import ErrorBoundary from "../../Utility/ErrorBoundary";
import FacetDisplay from "../FacetDisplay";


export interface ArticleDisplayProps {
  data: DataObject.NodeArticleInterface;
  view_mode: string;
}

export const ArticleDisplay = (props: ArticleDisplayProps) => {
  const { data, view_mode } = props;

  switch (view_mode) {
    case "card":
      return (
        <ErrorBoundary>
          <ArticleCard data={data} view_mode={view_mode} />
        </ErrorBoundary>
      );

    case "tile":
      return (
        <div>
          <h1>Article Tile View</h1>
        </div>
      );

    case "row":
      return (
        <ErrorBoundary>
          <ArticleRow data={data} view_mode={view_mode} />
        </ErrorBoundary>
      );

    default:
      return (
        <ErrorBoundary>
          {/* <TeamDisplay/> */}
          {/* <NewsRoomDisplay/> */}
          <FacetDisplay type={"node--article"} filterValue={"newsroom"} view_mode={"row"}/>
          {/* <ArticleFull data={data} view_mode={view_mode} /> */}
        </ErrorBoundary>
      );
  }
};

export default ArticleDisplay;
