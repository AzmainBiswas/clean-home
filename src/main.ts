import "./style.css";
import { createSearchSelection } from "./search-section.ts";
import "./background.ts"

const main = document.querySelector<HTMLDivElement>('#new-tab')!;
main.appendChild(createSearchSelection());
