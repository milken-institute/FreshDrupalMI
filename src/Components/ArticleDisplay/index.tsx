import React from "react";
import * as DataObject from "../../DataTypes/NodeArticle";
import ArticleFull from "./ArticleFull";
import ArticleCard from "./ArticleCard";
import ErrorBoundary from "../../Utility/ErrorBoundary";

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

    default:
      return (
        <ErrorBoundary>
          <ArticleFull data={data} view_mode={view_mode} />
        </ErrorBoundary>
      );
  }
};

export default ArticleDisplay;
