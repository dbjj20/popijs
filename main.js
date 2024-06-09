import {h} from 'preact'
import render from 'preact-render-to-string';
// import { createStaticHandler, createStaticRouter, StaticRouterProvider } from "react-router-dom/server";

import htm from 'htm';
const html = htm.bind(h);

export {
  html,
  render
}