import React, { Component } from 'react';

import './App.css';
import {patterns, getPatternKey} from './data/base.js'
let emulatedData = [];
let total = {right:0, mistake:0, betted:0};

export class App extends Component {
  constructor() {
    super();
    this.state = { 
      message: '',
      daylength:10,
      upperlimit:60,
      lowerlimit:40,
      selectdate:'2017-9-12',
      datas:[]};
  }

  componentDidMount() {
    /*fetch('/api/simulate')
      .then(response => response.json())
      .then(json => console.log(json));*/
  }

  render() {
    return (
      <div className="App">
        <div style={{width:'100%'}}>
          <div style={{width:'50%', float:'left'}}>
            <p>Select date</p><input type="text" value={this.state.selectdate} onChange={(evt)=>this.onInput4(evt)}/><br/>
            <p>day length</p><input type="text" value={this.state.daylength} onChange={(evt)=>this.onInput3(evt)}/><br/>
            <p><label>upper limit:<input type="text" value={this.state.upperlimit} onChange={(evt)=>this.onInput1(evt)}/></label></p>
            <label>lower limit:<input type="text" value={this.state.lowerlimit} onChange={(evt)=>this.onInput2(evt)}/></label>
            <p/>
            <button onClick={()=>this.onSimulate()}>Simulate</button>
          </div>
          <div style={{width:'50%'}}>
              <p>
                <span>Total Beted:</span><span ref="totalBetted"></span>
              </p>
              <p>
                <span>Rights:</span><span ref="rights"></span>
              </p>
              <p>
                <span>Mistakes:</span><span ref="mistakes"></span>
              </p>
          </div>
        </div>
        <div>
          {this.renderTable()}
        </div>                
      </div>
    );
  }

  onInput1(evt){
    this.setState({upperlimit:evt.target.value})
  }
  onInput2(evt){
    this.setState({lowerlimit:evt.target.value})
  }
  onInput3(evt){
    this.setState({daylength:evt.target.value})    
  }
  onInput4(evt){
    this.setState({selectdate:evt.target.value})        
  }
  onSimulate(){    
    var value = {
      method : 'post' ,
      headers : {
        'Accept': 'application/json',
        'Content-Type' : 'application/json',
      },
      body : JSON.stringify({
        daylength: this.state.daylength,
        upperlimit: this.state.upperlimit,
        lowerlimit:this.state.lowerlimit,
        selectdate:this.state.selectdate
      })
    };
    console.log(value)
    emulatedData = [];
    total = {right:0, mistake:0, betted:0};
    fetch('api/simulate',value)
      .then(res=>res.json())
      .then(json => {this.setState({datas:json}); console.log(json)} )
  }

  renderTable(){
    if (this.state.datas.length == 0) return false
    const {datas} = this.state
    const {patternHistory, sequences, todayRate, todaysequence, todayPatternKeySequence} = datas;
    return(
      <table className="dataTable">
        <thead>
          <tr>
            <td>Seq No</td>
            <td colSpan="10">Sequence</td>
            <td colSpan="4">Candidate Pattern(1)</td>
            <td colSpan="3">Candidate Pattern(2)</td>
          </tr>
        </thead>
        <tbody>
          {
            todaysequence.map((v,i)=>{
              return(
                <tr key={i}>
                  <td>{v.id}</td>
                  {v.seq.map((vv,j)=>(<td key={j}>{vv}</td>))}
                  { todayPatternKeySequence[i]?(<td>{patterns[todayPatternKeySequence[i].key-1]}</td>):(<td></td>) }
                  { todayPatternKeySequence[i]?(<td>{todayPatternKeySequence[i].patternState}</td>):(<td></td>) }
                  { todayPatternKeySequence[i]?(<td>{todayPatternKeySequence[i].pos}</td>):(<td></td>) }
                  { todayPatternKeySequence[i]?(<td>{todayPatternKeySequence[i].prevPercent}</td>):(<td></td>) }
                  {this.renderFirstPositionCandidate(todaysequence,i)}
                </tr>
              )
            })
          }
        </tbody>
      </table>
    )
  }

  renderFirstPositionCandidate(v,i){
    if (i>4){
      let candidateSeq = v.slice(i-5, i);
      let candidateNumbers = candidateSeq.map((v,i)=>v.seq[0])
      var names = [];
      var realCandidate = [];
      candidateNumbers.forEach(function(obj) {
          if (names.indexOf(obj) === -1) names.push(obj);
      });
      if (names.length != 5) {
        this.refs.totalBetted.innerHTML = `${total.betted}`
        this.refs.rights.innerHTML = `${total.right}`
        this.refs.mistakes.innerHTML = `${total.mistake}`
        return(<td></td>)
      }else{        
        for(var j=1; j<=10; j++){
          let found = names.find(function(element) {
            return element == j;
          });
          if (found == undefined)  realCandidate.push(j)
        }
        total.betted = total.betted+1;

        let currentFirstPosNumber = v[i].seq[0]
        
        let found = realCandidate.find(function(element) {
          console.log(element, currentFirstPosNumber,  element == currentFirstPosNumber)
          return element == currentFirstPosNumber;
        });
        if (found == undefined ){
          total.mistake = total.mistake+1;
        }else {
          total.right = total.right+1;          
        }
        let key = getPatternKey(realCandidate)
        
        if(emulatedData[key] == undefined){
          emulatedData[key] = (found == undefined?0:1)
        }else {
          emulatedData[key] = (found == undefined?`${emulatedData[key]}0`:`${emulatedData[key]}1`)
        }
        let myarray =[realCandidate.join(","), found, emulatedData[key]]
        //return(<td>{realCandidate.join(",")}</td>)
        this.refs.totalBetted.innerHTML = `${total.betted}`
        this.refs.rights.innerHTML = `${total.right}`
        this.refs.mistakes.innerHTML = `${total.mistake}`
        return(myarray.map((v,k)=><td key={k}>{v}</td>));
      }      
    }else{
        this.refs.totalBetted.innerHTML = `${total.betted}`
        this.refs.rights.innerHTML = `${total.right}`
        this.refs.mistakes.innerHTML = `${total.mistake}`
      return (<td></td>)
    }
  }
}

//export App;
