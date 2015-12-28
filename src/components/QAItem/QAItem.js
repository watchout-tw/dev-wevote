import React, { Component, PropTypes } from 'react';
import { Link } from "react-router";
import classnames from 'classnames';
import eng2cht from '../../utils/eng2cht';
import scrollTo from '../../utils/scrollTo';

export default class QAItem extends Component {
  static propTypes = {   
  }
  constructor(props){ super(props)
      let completed = (props.completed) ? "answer" : "question";
      let shouldReset = (props.completed) ? false : true;
     
      this.state = {
          completed: completed,
          shouldReset: shouldReset
      }
      
  }
  _onAnswer(choice, e){
    const {data, recordHandler} = this.props;
   
    this.setState({
        completed: "answer",
        shouldReset: false
    })
 
    recordHandler(data.issueName, data.order, choice);
    this._scrollToNextQuestion();
  }
  _scrollToNextQuestion(){
    const {data, currentQAItemIndex, maxIndex, unlockNext, onShowMatchResult} = this.props;
    if(data.order === maxIndex){
      
      //it is the last one! 回報給上頭
      onShowMatchResult();

      //scroll to id = rankResultSection
      // 需要等 timeout 一小段時間，讓 obj 先出現，才能抓到對應位置，知道要滑到哪裡去
      setTimeout(()=>{
          
          // Scroll to answer section
          let target = document.getElementById("rankResultSection");
          let targetPos = document.body.scrollTop + target.getBoundingClientRect().top;
      
          scrollTo(document.body, targetPos, 120);

      }, 50)

      return;
    }
    let timeout = 0;
    if(data.order === currentQAItemIndex){
      unlockNext();
      timeout = 50;
    }

    // 需要等 timeout 一小段時間，讓 obj 先出現，才能抓到對應位置，知道要滑到哪裡去
    setTimeout(()=>{
        let nextqId = `Question${data.order+1}`;
    
        // Scroll to answer section
        let target = document.getElementById(nextqId);
        let targetPos = document.body.scrollTop + target.getBoundingClientRect().top;
    
        scrollTo(document.body, targetPos, 120);

    },timeout)
  }
  
  componentWillReceiveProps(nextProps){
    //reset
    if(nextProps.completed === false){
      this.setState({
        completed: "question",
        shouldReset: true
      })
    }
  }

  render() {
    const styles = require("./QAItem.scss")
    const {data, currentQAItemIndex, userChoices, 
           matchData, maxIndex} = this.props;
    const {completed, shouldReset} = this.state;
    //console.log(data.order+":"+completed)

    let qaItemClasses = classnames({
      [styles.QAItem] : true,
      [styles.isActive] : data.order <= currentQAItemIndex
    })

    let toNextItem = "";
    //作答之後才顯示下一題 or 看結果的選項
    if(completed === "answer"){
       toNextItem = (data.order < maxIndex) ? 
                    <div className={styles.button}
                         onClick={this._scrollToNextQuestion.bind(this)}>下一題</div> :
                    <div className={styles.button}
                         onClick={this._scrollToNextQuestion.bind(this)}>看結果</div> ;
    }

    let userVote = userChoices[data.issueName];

    return (
        <div className={qaItemClasses}
             id={data.id}>
            <div className={styles.questionContent}>
                <div className={styles.questionTitle}>{data.order+1}. {data.title}</div>
                <div className={styles.questionDescription}>{data.description}</div>
                <div className={styles.optionSection}>
                    <OptionItem value="aye"  title="贊成"  isUserVote={userVote==='aye'} 
                                onAnswerHandler={this._onAnswer.bind(this)}/>
                    <OptionItem value="nay"  title="反對"  isUserVote={userVote==='nay'} 
                                onAnswerHandler={this._onAnswer.bind(this)}/>
                    <OptionItem value="none" title="沒意見" isUserVote={userVote==='none'} 
                                onAnswerHandler={this._onAnswer.bind(this)}/>
                </div>
            </div>
           
        </div>
    );
  }
}
class OptionItem extends Component {
  
  render() {
    const styles = require("./QAItem.scss")
    const {value, title, isUserVote, onAnswerHandler} = this.props;
    let optionClasses = classnames({
        [styles.optionItem]: true,
        [styles.isChoosed]: isUserVote
    });

    return (
        <div className={`${optionClasses} ${styles[value]}`}
             onClick={onAnswerHandler.bind(null, value)}>{title}</div>
    );
  }
}
