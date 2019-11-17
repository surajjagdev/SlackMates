//array of errors [{path:"", message:"DNE"}];
//and create an obj with like
//{email:['error1', 'error2]}
/*export default errors => {
  errors.reduce((acculator, currentValue) => {
    if (currentValue.path in acculator) {
      acculator[currentValue.path].push(currentValue.message);
    } else {
      acculator[currentValue.path] = [currentValue.message];
    }
    return acculator;
  }, {});
};*/

export default errors =>
  errors.reduce((acculator, currentValue) => {
    if (currentValue.path in acculator) {
      acculator[currentValue.path].push(currentValue.message);
    } else {
      acculator[currentValue.path] = [currentValue.message];
    }
    return acculator;
  }, {});
