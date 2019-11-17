import React from 'react';
import styled from 'styled-components';
import { Header } from 'semantic-ui-react';
const HeaderWrapper = styled.div`
  grid-row: 1;
  grid-column: 3;
`;
export default ({ channelName }) => {
  return (
    <HeaderWrapper>
      <Header textAlign="center" as="h1">
        #{channelName}
      </Header>
    </HeaderWrapper>
  );
};
