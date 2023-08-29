/*
 * component that serves as the multi-select form item for any form that wants to select on genre
 *
 * This will intiate a GET request
 * for all genres from the API
 *
 * It is intended to work as a 
 * react-bootstrap form component
 */

import Form from 'react-bootstrap/Form';


function GenreMultiSelect({
  controlId,
  placeholder,
  onChange,
  name,
  label = "Genre(s)",
  caption = "ctrl/cmd + click to select multiple",
}) {
  /* 
   * props:
   *  controlId: the control id to be set for the overall form group
   *  placeholder: the placeholder text
   *  onChange: the function to call whenever a change occurs
   *            passed down from the parent form
   *  name: the name to use for the form control element 
   *
   *  label: the title for this Form Component
   */

  function handleSelectChange({ target: { selectedOptions } }) {
    /* function to handle the selection change
     *
     * Input:
     *    an event fed into the onChange prop of the selection
     *    we extract the event.target.selectedOptions field
     *    which holds all of the selected options
     *      
     *      You can call on the value of a selected options with 
     *      option.value
     */
    console.group("Genre Select Change Handler")
    console.info(selectedOptions)

    // this becomes an array of the selected options values
    // turned into integers
    let options_array = Array
      .from(selectedOptions)
      // + casts to number
      .map(option => +option.value)
    console.info(options_array)

    console.groupEnd()
  }
  return (
    <>
      <Form.Group controlId={controlId}>
        <Form.Label>{label}</Form.Label>
        <Form.Select
          onChange={handleSelectChange}
          name={name}
          size="5"
          aria-label="Default select example"
          multiple
        >
          <option value="1">One</option>
          <option value="2">Two</option>
          <option value="3">Three</option>
        </Form.Select>
        <Form.Text className="text-muted">
          {caption}
        </Form.Text>
      </Form.Group >
    </>
  );
}

export default GenreMultiSelect


