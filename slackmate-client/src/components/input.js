import React from 'react';
import styled from 'styled-components';
import { Input, Button, Icon } from 'semantic-ui-react';
import { withFormik } from 'formik';
import FileUpload from './fileupload.js';

const InputWrapper = styled.div`
  grid-row: 3;
  grid-column: 3;
  margin: 20px;
  color: 'black';
  display: grid;
  grid-template-columns: 50px 1fr;
`;
const SendMessage = ({
  placeholder,
  values,
  handleChange,
  handleBlur,
  handleSubmit,
  isSubmitting,
  channelId
}) => (
  <InputWrapper>
    <FileUpload channelId={channelId} disableClick={false}>
      <Button>
        <Icon name="plus" />
      </Button>
    </FileUpload>
    <Input
      onKeyDown={e => {
        if (e.keyCode === 13 && !isSubmitting) {
          handleSubmit();
        }
      }}
      name="message"
      value={values.message}
      onBlur={handleBlur}
      onChange={handleChange}
      placeholder={`Message ${placeholder}`}
    />
  </InputWrapper>
);
export default withFormik({
  mapPropsToValues: () => ({ message: '' }),
  handleSubmit: async (
    values,
    { props: { onSubmit }, setSubmitting, resetForm }
  ) => {
    //if message doesnt exist dont submit
    if (!values.message || values.message.trim()) {
      setSubmitting(false);
    }
    await onSubmit(values.message);
    resetForm(false);
  }
})(SendMessage);
