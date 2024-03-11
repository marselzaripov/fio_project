import React, { useState, useEffect } from "react";
import initialSource from "../data/data";
import Select from "../components/select2";

export default function Rnd() {

  // useEffect(() => {
  //   setState(initialSource.state);
  // }, []);


  const initialSourceMap = {
    state: 0,
    district: 1,
    commune: 2,
  };

  const [name, setName] = useState('');
  const [surname, setSurname] = useState('');
  const [passportNumber, setPassportNumber] = useState(0);
  const [state, setState] = useState([]);
  const [district, setDistrict] = useState([]);
  const [commune, setCommune] = useState([]);
  const [selectedCommune, setSelectedCommune] = useState(0);
  const [sourceMap] = useState(initialSourceMap);

  useEffect(() => {
    setState(initialSource.state);
  }, []);


  const handleChange = (params) => (ev) => {
    const target = ev.currentTarget;
    //alert(target.getAttribute('value'));
    const { value } = target;
    const { current, next } = params;
    setNewValues({ value, current, next });
    if(current === 'commune'){setSelectedCommune(initialSource['commune'][value-1]['communeId'])};
  };

  const setNewValues = ({ value, current, next }) => {
    const data = initialSource[next];

    if (data) {
      switch (next) {
        case "district":
          setDistrict(data.filter((el) => el[current] === Number(value)));
          break;
        case "commune":
          setCommune(data.filter((el) => el[current] === Number(value)));
          break;
        default:
          break;
      }
    }

    clearValues(next);
  };

  const clearValues = (next) => {
    const nextkey = sourceMap[next];

    Object.keys(sourceMap).forEach((key) => {
      if (sourceMap[key] > nextkey) {
        switch (key) {
          case "state":
            setState([]);
            break;
          case "district":
            setDistrict([]);
            break;
          case "commune":
            setCommune([]);
            break;
          default:
            break;
        }
      }
    });
  };


  function handleFormSubmit(e) {
    e.preventDefault()

    const requestOptions = {
      method: "POST",
      body: JSON.stringify({
        user_name: name, 
        user_surname: surname, 
        user_passport: passportNumber,
        commune_id: selectedCommune}),
      headers: {"Content-type": "application/json"}
    }

    fetch("https://jsonplaceholder.typicode.com/posts", requestOptions)
    .then(response => response.json())
    .then(datas => {
      console.log(datas)
    })
    .catch(error => {
      console.error(error)
    })
  }

  

  return <form onSubmit={handleFormSubmit}>

    <input type="text" value={name} name="userName" onChange={e => setName(e.target.value)} />
    <input type="text" value={surname} name="userSurame" onChange={e => setSurname(e.target.value)} />
    <input type="number" value={passportNumber} name="userSurame" onChange={e => setPassportNumber(e.target.value)} />
  

    <Select data={state} action={handleChange} current="state" next="district" />
    <Select data={district} action={handleChange} current="district" next="commune"/>
    <Select data={commune} action={handleChange} current="commune"/>
          
    <input type="submit" />
  </form>
}
