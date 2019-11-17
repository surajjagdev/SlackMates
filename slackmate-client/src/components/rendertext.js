import React from 'react';

class RenderText extends React.Component {
  state = { text: '' };
  componentDidMount = async () => {
    const response = await fetch(this.props.url);
    const text = await response.text();
    this.setState({ text });
  };
  render() {
    const { text } = this.state;
    return (
      <div>
        <div style={{ color: 'red', textAlign: 'center' }}>
          -----Text File------
        </div>
        <p>{text}</p>
        <div style={{ color: 'red', textAlign: 'center' }}>
          -----End of Text File------
        </div>
      </div>
    );
  }
}
export default RenderText;
