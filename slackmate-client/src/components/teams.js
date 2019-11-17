import React from 'react';
import styled from 'styled-components';
import { Link } from 'react-router-dom';
const TeamWrapper = styled.div`
  background-color: #362234;
  grid-row: 1/4;
  grid-column: 1;
  color: #958993;
`;
const TeamList = styled.div`
  width: 100%;
  padding-left: 0px;
  list-style: none;
`;
const TeamListWrapper = styled.div`
  height: 50px;
  width: 50px;
  background-color: #676066;
  color: #fff;
  margin: auto;
  margin-bottom: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  border-radius: 11px;
  &:hover {
    border-style: solid;
    border-width: thick;
    border-color: #767676;
  }
`;
const team = ({ id, name }) => {
  return (
    <Link to={`/viewteam/${id}`} key={`team-${id}`}>
      <TeamListWrapper>{name}</TeamListWrapper>
    </Link>
  );
};
export default ({ teams }) => {
  return (
    <TeamWrapper>
      <TeamList>
        {teams.map(team)}
        <Link to={`/createteam`} key={'add-new-team'}>
          <TeamListWrapper>+</TeamListWrapper>
        </Link>
      </TeamList>
    </TeamWrapper>
  );
};
