
import React from "react";
import ReactDOM from "react-dom";
import ArticleDisplay from "components/ArticleDisplay";

const ArticleDetail = document.querySelector('article-detail');

ReactDOM.render(
  <ArticleDisplay data={ArticleDetail.dataset} view_mode={"full"} />,
  ArticleDetail
);