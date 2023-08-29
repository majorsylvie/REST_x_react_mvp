/*
 * component that serves as the select form item 
 * for ANY model 
 *
 * This will intiate a GET request
 * for all genres from the API
 *
 * It is intended to work as a 
 * react-bootstrap form component
 */

import axios from "axios";
import { useEffect, useState } from 'react';
import Form from 'react-bootstrap/Form';
import MultiSelectItem from './GenreMultiSelectItem';

function GenericModelSelect({
  parentFormName,
  onChange: parentOnChange,
  modelName,
  selectedValues,

}) {
  /* 
   * props:
   *  controlId: the control id to be set for the overall form group
   *  onChange: the function to call whenever a change occurs
   *            passed down from the parent form
   *
   *  name: the name to use for the form control element 
   *
   *  label: the title for this Form Component
   */

  const [models, setModels] = useState([]);
  // to store loading status 
  const [isLoading, setIsLoading] = useState(false);
  // to store and errors from fetching from the API
  // either null or some error
  const [error, setError] = useState(null);

  useEffect(() => {

    // flag for ignoring stale request responses
    let ignore_request_output = false;
    // signal controller to be able to cancel axios request 
    let controller = new AbortController();
    fetchModelHandler()

    // cleanup function
    return (() => {
      ignore_request_output = true;
      controller.abort()
    });

    function fetchModelHandler() {
      // function to actually fetch from API
      setIsLoading(true);
      setError(null);


      // then chains are really nice, literally taking the output from the previous .then as the input to the next one
      // the first argument is a function you define to run when the Promise successfully returns
      axios.get(
        // just getting the list
        `http://localhost:8000/api/${modelAPIRoute}/`,
        {
          // axios signal config
          timeout: 5000,
          // the signal to look at for cancellations
          signal: controller.signal,
        }
      )
        .then(response => {
          console.info("axios successfully returned with:", response);
          return response.data
        })

        .then((data) => {
          if (!ignore_request_output) {
            setError(false)
            console.info("received data", data);
            let responseModels = parseModelList(data)


            setIsLoading(false)
            setModels(responseModels);
          } else {
            console.warn("received request where ignore_request_output was True", data)
          }

          console.groupEnd()

        }).catch(
          error => {
            console.error("RECEIVED AXIOS ERROR:", error);
            console.groupEnd();
            setIsLoading(false)
            setError(error)
          }

        );
      // END OF FETCH GENRE HANDLER
    }
  },
    // dependency array empty 
    []
  );

  function parseModelList(responseData) {
    /* 
     * function to take in the data response from the /genres/ GET
     * and turn it into an array of javascript objects
     */
    return responseData.results
  }

  function handleSelectChange({ target }) {
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
    console.group(`Generic (${modelName}) Model Select Change Handler`)
    console.warn(target.name)
    parentOnChange({ target })

    console.groupEnd()
  }

  let controlId = parentFormName + modelName
  // fill in the content based on the loading status 
  let content

  if (models.length > 0 && !error) {
    content = (<>
      <Form.Select
        // while the values in the html option elements are specified as strings, 
        // the array can be a mix of integers or strings and they are processed correctly
        // eg: 
        //    value = ["1", 2] // will bind values "1" and "2"
        value={selectedValues}
        onChange={handleSelectChange}
        name={modelName}
        size={`${models.length <= 8 ? models.length : 8}`}
        aria-label={`${modelName} ${canSelectMultiple ? 'Multi-Select' : 'Select'}`}
        multiple={canSelectMultiple}
        // disable the selection only if there was an error
        disabled={error}
      >
        {models
          .map(({ id, name }) =>
            <MultiSelectItem
              // primary key guarenteed to be unique from DB
              key={id}
              id={id}
              name={name} />)}
      </Form.Select >
      {/* if you can select multiple, add the note about how to do so */}
      {canSelectMultiple &&
        <Form.Text className="text-muted">
          ctrl/cmd + click to select multiple
        </Form.Text>}

    </>);
  }

  else {
    // text to fill in with if we didn't get our genres normally
    let only_value_text
    if (models.length === 0) {
      only_value_text = `No ${modelName} s Found`
    }
    if (error) {
      only_value_text = `${error}`
    }
    if (isLoading) {
      only_value_text = "Loading..."
    }

    content = (<>
      <Form.Select
        size="1"
        aria-label={`${modelName} Select`}
        disabled
      >
        <option>{only_value_text}</option>
      </Form.Select >

    </>);
  }

  return (
    <>
      <Form.Group controlId={controlId}>
        <Form.Label>
          {`${modelName}${canSelectMultiple ? '(s)' : ''}`}
        </Form.Label>
        {content}
      </Form.Group >
    </>
  );
}

export default GenericModelSelect
