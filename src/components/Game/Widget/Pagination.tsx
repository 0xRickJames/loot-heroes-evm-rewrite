import styled from "styled-components"
import ReactPaginate from "react-paginate"

// @ts-ignore
export const PaginationWidget = styled(ReactPaginate).attrs({
  activeClassName: "active", // default to "disabled"
})`
  display: flex;
  flex-direction: row;
  justify-content: center;
  list-style-type: none;
  margin-top: 1.5em;

  li a {
    margin: 0.3em;
    padding: 0.6em;
    border: #2c4250 4px solid;
    cursor: pointer;
    font-size: 1em;
  }

  li.previous a,
  li.next a,
  li.break a {
    border-color: transparent;
  }

  li.active a {
    background-color: #4e6a8a;
    color: white;
  }

  li.disabled a {
    color: grey;
  }

  li.disable,
  li.disabled a {
    cursor: default;
  }
`
