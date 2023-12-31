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
import MultiSelectItem from "./SelectItem";

function GenericModelSelect({
  parentFormName,
  onChange: parentOnChange,
  modelName,
  selectedValues,
  canSelectMultiple,

}) {
  /* 
   * props:
   *  parentFormName: the name of the overall form component that is invoking this generic component. Used to contruct the controlId for the Form.Group
   *
   *  onChange: the function to call whenever a change occurs
   *            passed down from the parent form
   *
   *  modelName: the name of the actual model being used for this generic component. 
   *    Used to determine:
   *      the API endpoint
   *      controlId (parentFormName + modelName)
   *      how data is parsed in parseModelListForFormOptions()
   *
   *    Acceptable values: (the singular, lowercase, non-caps django version name of the model)
   *      book
   *      bookinstance
   *      genre
   *      language
   *      author
   *  
   *    
   *  canSelectMultiple: boolean to tell if this should be a multi-select or a single selection.
   *      eg: books should only be able to select one author
   *          but books should be able to select multiple languages
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

      let modelAPIRoute = getAPIRouteFromModelName(modelName)

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
            let responseModels = parseModelListForFormOptions(data)


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

  function getAPIRouteFromModelName(modelName) {
    let isBook = modelName === "book"
    let isBookInstance = modelName === "bookinstance"
    let isAuthor = modelName === "author"
    let isGenre = modelName === "genre"
    let isLanguage = modelName === "language"
    if (isBook || isBookInstance || isAuthor || isGenre || isLanguage) {
      return modelName + "s"
    } else {
      let error = "Given invalid modelName in API route selector:" + modelName
      console.error(error)
      setError(error)
      return ""
    }
  }
  function parseModelListForFormOptions(responseData) {
    /* 
     * function to take in the data response from the /genres/ GET
     * and turn it into an array of javascript objects
     * specifically with field values:
     *
     *  id: primary key of the model
     *  name: the display name for each model, to be used
     *        in the drop down
     */

    console.group("Parsing Model List")
    let isBook = modelName === "book"
    let isBookInstance = modelName === "bookinstance"
    let isAuthor = modelName === "author"
    let isGenre = modelName === "genre"
    let isLanguage = modelName === "language"

    console.info(modelName, "with responseData:", responseData)

    let output = [];
    if (isBook) {
      return [
        { id: 1, name: "DUMMY BOOK" },
        { id: 2, name: "SECOND DUMMY BOOK" },
      ]

    } else if (isBookInstance) {
      return [
        { id: 1, name: "DUMMY BOOK INSTANCE" },
        { id: 2, name: "SECOND DUMMY INSTANCE" },
      ]

    } else if (isAuthor) {
      output = shapeAuthorResults(responseData.results)

    } else if (isGenre) {
      // genre comes baked in with id and name fields
      output = responseData.results

    } else if (isLanguage) {
      // genre comes baked in with id and name fields
      output = responseData.results

    } else {
      let error = "Given invalid modelName in generic model select:" + modelName
      console.error(error)
      setError(error)

    }
    return output
  }

  function shapeAuthorResults(authorArray) {
    /* function to take in the responseData.results array
     * of authors and turn them into a set of objects 
     * with only fields of 
     * id, and 
     * name
     *
     * Input:
     *    authorArray: array of objects returned from 
     *                 axios GET call.
     *
     *                 Has fields of:
     *                   url
     *                   id
     *                   first_name
     *                   last_name
     *                   date_of_birth
     *                   date_of_death
     *                   books
     */
    return authorArray.map(({ id, first_name, last_name }) => {
      const name = first_name + " " + last_name
      return {
        id: id,
        name: name,
      }
    });
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

    let selected
    if (canSelectMultiple) {
      let htmlSelected = target.selectedOptions
      selected = Array
        .from(htmlSelected)
        // + casts to number
        .map(option => +option.value)
      console.log("multi selected:", selected)

    } else {
      // only allowing single values
      selected = target.value
      console.log("single selected:", selected)
    }
    let changeObject = {
      modelName: modelName,
      selectedValues: selected
    }
    console.info("sending up changeObject:", changeObject, "to parent")
    console.groupEnd()
    parentOnChange(changeObject)

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
