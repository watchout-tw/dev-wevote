import React, {Component, PropTypes} from 'react';
import {bindActionCreators} from 'redux';
import {Link} from 'react-router';
import DocumentMeta from 'react-document-meta';
import {connect} from 'react-redux';

import CandidateProfileCards from '../../components/CandidateProfileCards/CandidateProfileCards.js';
import DistrictFlag from '../../components/DistrictFlag/DistrictFlag.js';

import district2cht from '../../utils/district2cht';
import parseToLegislatorPosition from '../../utils/parseToLegislatorPosition';
import getDistrictCandidates from '../../utils/getDistrictCandidates'; //該區參選人資訊
import getDistrictLegislators from '../../utils/getDistrictLegislators'; //現任立委資訊
import getPeopleTableData from '../../utils/getPeopleTableData';

import getRecords from '../../data/getRecords';
const records = getRecords();
import getCandidates from '../../data/getCandidates';
const candidates = getCandidates();

@connect(
    state => ({
      legislators: state.legislators,
      issues: state.issues
    }),
    dispatch => bindActionCreators({}, dispatch))

export default class Constituency extends Component {

  constructor(props){ super(props)
    const {issues, legislators} = props;
    const {area, areaNo} = props.params;

    let legislatorPositions = parseToLegislatorPosition(records, issues, legislators);
    let candidateList = getDistrictCandidates(candidates, area, areaNo);
    let tableData = getPeopleTableData(legislatorPositions, candidateList);
    let legislatorList = getDistrictLegislators(legislators, area, areaNo);

    let comparableCandidates = [];//有過去紀錄 or 有未來承諾的候選人
    let noDataCandidates = [];

    candidateList.map((people, index)=>{
        var combined = {
          id: people.id,
          name: people.name,
          party: people.party,
          hasReply: people.hasReply,
          positions: tableData[people.id].positions,
          bills: people.bills
        };

        if(people.hasReply || legislators[people.id]){//已回覆，或者是第八屆立委
            comparableCandidates.push(combined);
        }else{
            noDataCandidates.push(combined);
        }

    })

    this.state = {
        candidateList: candidateList,
        legislatorList: legislatorList,
        comparableCandidates: comparableCandidates,
        noDataCandidates: noDataCandidates,
        side: 'front'
    }
  }
  _toggle(){
    const {side} = this.state;
    if(side === 'front'){
        this.setState({ side: 'back' });
    }else{
        this.setState({ side: 'front' });
    }

  }
  render() {
    const styles = require('./Constituency.scss');
    const {area, areaNo} = this.props.params;
    const {candidateList, legislatorList, comparableCandidates, noDataCandidates, side} = this.state;
    let noItem = (areaNo) ? <div>第{areaNo}選區</div> : "";

    //應選 x 名
    let shouldElect = 1;
    if(["LAB","MAB"].indexOf(area) !== -1){
       shouldElect = 3;
    }

    //本區現任立委
    let currentLegislatorItems = legislatorList.map((people, index)=>{
        let hasResignInfo, separatorItem;
        if(people.hasResigned === true){
           hasResignInfo = "（已離職）";
        }
        if(index !== legislatorList.length -1){
           separatorItem = "、";
        }
        return (
          <span key={index}>
            <Link to={`/people/${people.id}/records/`}
                  className={`${styles.ia} ${styles.black}`}>{people.name}</Link>
            {hasResignInfo}{separatorItem}
          </span>
        )
    })
    //flip button,  沒有可比較資料時隱藏
    let toggleText = (side==="front")? "立場PK" : "戰鬥目標";
    let flipButton = (comparableCandidates.length > 0) ? (
      <div className={styles.flipButton}
           onClick={this._toggle.bind(this)}>
           {toggleText}
      </div>
      ): <div>本區候選人全員失蹤中，需要你的關心</div>;
    //card
    let cardSection = (comparableCandidates.length > 0) ? (
      <CandidateProfileCards area={area}
                             areaNo={areaNo}
                             side={side}
                             candidateList={comparableCandidates}/>
    ) : "";
    //協尋中
    let wantedSection = (noDataCandidates.length > 0) ? <Wanted noDataCandidates={noDataCandidates} /> : "";


    return (
      <div className={styles.wrap}>

          <div className={styles.mainContent}>
              <DistrictFlag area={area} areaNo={areaNo} />
              <div className={styles.districtInfo}>
                  <h3 className={styles.electCount}>本區將選出 {shouldElect} 位勇者</h3>
                  <div className={styles.currentLegislators}>現任代表：{currentLegislatorItems}</div>
              </div>
              {flipButton}
              {cardSection}
              {wantedSection}
          </div>
          <div className={styles.bgHolder}></div>

      </div>
    );
  }
}
class Wanted extends Component {
  render(){
      const {noDataCandidates} = this.props;
      const styles = require('./Constituency.scss');

      let missingTitle = require("./images/missing.svg");
      //沒有資料的立委們
      let noDataCandidateItems = noDataCandidates.map((people, index)=>{
          let separatorItem;
          if(index !== noDataCandidates.length -1){
             separatorItem = "、";
          }
          return (
            <span className={styles.noDataCandidate}>
                <div className={styles.partyItem}>
                    <div className={`${styles.partyFlag} ${styles.small} ${styles[people.party]}`}></div>
                </div>
                <Link to={`/people/${people.id}/promises/`}
                      className={`${styles.nameItem} ${styles.ia} ${styles.black} ${styles.line}`} >{people.name}
                </Link>
                {separatorItem}
            </span>
          );
      });

      return (
          <div className={styles.partyRoll}>
              <div className={`${styles.partyRollEndpoint} ${styles.top}`}>
                  <img src={missingTitle}
                       className={styles.missingTitle}/>
              </div>
              <div className={styles.partyRollMain}>
                  <div className={styles.intro}>以下立委沒有過去表態資料（非第八屆立委），亦尚未回覆未來表態資料。</div>
                  {noDataCandidateItems}
                  <div className={styles.wantedLinkWrap}>
                    <Link className={styles.wantedLink}
                          to={`/wanted/`}>前往協尋</Link>
                  </div>
              </div>
              <div className={`${styles.partyRollEndpoint} ${styles.bottom}`}></div>
          </div>
      )
  }
}
