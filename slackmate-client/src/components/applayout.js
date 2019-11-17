import styled from 'styled-components';
export default styled.div`
  display: grid;
  height: 100vh;
  grid-template-columns: 100px 250px 1fr;
  grid-template-rows: auto 1fr auto;
  @media (max-width: 640px) {
    display: grid;
    height: 100vh;
    grid-template-columns: auto;
    grid-template-rows: auto 1fr auto;
  }
`;
