import React, {Component, PropTypes} from 'react';
import { Link } from "react-router";
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';

import moment from 'moment';
import eng2cht from '../../utils/eng2cht';
import position2color from '../../utils/position2color';
import position2points from '../../utils/position2points';
import people_name2id from '../../utils/people_name2id';

import PeopleAvatar from '../../components/PeopleAvatar/PeopleAvatar.js';


import {loadCandidates} from '../../ducks/candidates.js';

@connect(
    state => ({ 
      candidates: state.candidates.data
    }),
    dispatch => bindActionCreators({loadCandidates}, dispatch))

export default class RecordTable extends Component {
  constructor(props) { super(props)
      this.state = {
          categoryFilter: '所有',
          sortingOption: '按時序排',
          ascending: false,
          candidatesLoaded: false,
          candidates: ""
      }
  }
  componentWillMount(){
    this.props.loadCandidates();
  }
  componentWillReceiveProps(nextProps){
    if( nextProps.candidates){
      this.setState({
          candidatesLoaded: true,
          candidates: nextProps.candidates.value
      })  
    }
  }
  _setCategoryFilter(value, event){
    this.setState({ categoryFilter: value });
  }
  _setSortingOption(value, event){
    if(this.state.sortingOption === value){
      this.setState({ ascending: !this.state.ascending });
    }else{
      this.setState({ sortingOption: value });
    }

  }
  render() {
    const {candidatesLoaded} = this.state;
    if(!candidatesLoaded) return <div></div>;

    const styles = require('./RecordTable.scss');
    const {data} = this.props;
    const {candidates} = this.state;

    const categoryFilters = ['所有','提案','發言','表決'];
    const {ascending, categoryFilter, sortingOption} = this.state;

    const sortingOptions = ['按時序排','按立場排'];


    ///////
    let records = data.records
    .filter((item, index)=>{
        if(categoryFilter==='所有'){
            return item
        }else{
            if(item.category === categoryFilter)
                return item;
        }
    })
    .sort((a,b)=>{

        if(sortingOption === '按立場排'){
            if(ascending){
                return position2points(a.position)-position2points(b.position);
            }else{
                return position2points(b.position)-position2points(a.position);
            }

        }else{
            if(ascending){
                return a.date-b.date;
            }else{
                return b.date-a.date;
            }

        }


    })
    .map((item,index)=>{
        return <Record data={item} key={index} candidates={candidates}/>
    });


    //////
    let options = categoryFilters.map((v,i)=>{
        let active = (v===categoryFilter) ? styles.controlButtonActive : "";
        return <div className={`${styles.controlButton} ${active}`}
                    key={i}
                    onClick={this._setCategoryFilter.bind(this,v)}>
                    {v}</div>
    });

    ////
    let sortings = sortingOptions.map((v,i)=>{
        let active = (v===sortingOption) ? styles.sortingButtonActive : "";
        return <div className={`${styles.sortingButton} ${active}`}
                    key={i}
                    onClick={this._setSortingOption.bind(this,v)}>
                    {v}</div>
    })
    ///

    let isEvading = (data.dominantPosition === "evading" && records.length === 0);
    let controlPanelItem;
    if(!isEvading) {
      controlPanelItem = (
        <div className={styles.controls}>
              {options}
              <div className={styles.sortingButtons}>{sortings}</div>
        </div>
      );
    }

    let evadingItem;
    if(isEvading){
       evadingItem = (
          <div className={styles.evadingItem}>
               <div className={styles.evadingText}>我應該表態，卻沒有表態。</div>
               <Link className={`${styles.evadingFAQ} ${styles.ia} ${styles.bright}`}
                     to={`/about/FAQ/`}>我們是如何判斷的？</Link>

          </div>)
    }

    return (
      <div className={styles.wrap}>
            {controlPanelItem}
            {evadingItem}
            {records}
      </div>
    );
  }

  props = {
    className: ''
  }
}
class Record extends Component {
  static propTypes = {
    data : PropTypes.object.isRequired
  }


  render() {
    const styles = require('./RecordTable.scss');
    const {data, candidates} = this.props;

    let date = moment.unix(data.date);

    return (
      <div className={styles.aRecordRow}>
        <Link to={`/people/${people_name2id(data.legislator)}/records/`} className={styles.avatar}>
          <div className={styles.avatarImg}>
            <PeopleAvatar id={people_name2id(data.legislator)} candidates={candidates}/>
          </div>
          <div className={styles.avatarName}><div className={styles.name}>{data.legislator}</div></div>
        </Link>
        <div className={styles.detail}>
          <div className={`${styles.positionCube} ${styles[data.position]}`}></div>
          <Link to={`/records/${data.id}`}
            className={`${styles.date} ${styles.ia} ${styles.bright}`}>{date.format('YYYY-MM-DD')}</Link>
          <div className={styles.category}>{data.category}</div>
          <div className={styles.content}>{data.content}</div>
        </div>
      </div>
    )
  }

  props = {
    className: ''
  }
}
