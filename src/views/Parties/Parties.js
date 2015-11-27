import React, { Component, PropTypes } from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { Link } from 'react-router';
import classnames from 'classnames';
import prefixr from 'react-prefixr';
import eng2party_short from '../../utils/eng2party_short';
@connect(
    state => ({
                partyBlock: state.partyBlock   
              }),
    dispatch => bindActionCreators({}, dispatch))

export default class Parties extends Component {
  static propTypes = {
  }
  constructor(props){ super(props)
      this.state = {
          focus: "KMT",
          showMenu: false
      }
  }
  componentDidMount(){
      this.setState({
          innerWidth: window.innerWidth
      })
      window.addEventListener('scroll', this._onResize.bind(this));
  }
  componentWillUnmount(){
      window.removeEventListener('scroll', this._onResize.bind(this));
  }
  _onResize(){
      this.setState({
          innerWidth: window.innerWidth
      })
  }
  _onChangeFocus(value, event){
      console.log(value)
      this.setState({
          focus: value,
          showMenu: false
      })  
  }
  _setMenu(value, event){
      this.setState({
          showMenu: value
      }) 
  }
  render() {
    const styles = require('./Parties.scss');
    const {partyBlock} = this.props;
    const {focus, showMenu} = this.state;
   
    /* current display party */
    let data = partyBlock[focus];
    let list = partyBlock[focus].list || [];

    let columnItems = list.map((v,i)=>{
        return <li>{v}</li>
    });
    let columnClasses = classnames({
      [styles.columnBlock] : true,
      [styles.twoColumns] : list.length >= 17
    })
    let partyRollItem = (
        <div className={styles.partyRoll}>
              <h2 className={styles.partyTitle}>
                  {data.title}參戰名單
              </h2>
              <section className={columnClasses}>
                  <ol>{columnItems}</ol>
              </section>
        </div> 
    );

    let menuClasses = classnames({
      [styles.partyMenuBlock]: true,
      [styles.show] : showMenu === true
    })
    return (
      <div className={styles.wrap}>
          <div className={styles.toggleMenu}>
            <div className={`${styles.hexagon} ${styles.partyMenuItem}`}
                 onClick={this._setMenu.bind(this, true)}>
                <div className={styles.innerHexagon}>選擇</div>
            </div>
          </div>
          <div className={menuClasses}>
              <div className={styles.closeMenu}
                   onClick={this._setMenu.bind(this, false)}>
                <i className="fa fa-times"></i>
              </div>
              <div className={`${styles.billboard} ${styles.left}`}>
                  <PartyMenu side={1} 
                             onChangeFocus={this._onChangeFocus.bind(this)}
                             focus={focus}/></div>
              <div className={`${styles.billboard} ${styles.right}`}>
                  <PartyMenu side={2} 
                             onChangeFocus={this._onChangeFocus.bind(this)}
                             focus={focus}/></div>
          </div>
          <div className={styles.partyWrap}>
              <div className={styles.partyRollTop}></div>
              <div className={styles.partyFlow}>
                  {partyRollItem}
              </div>
          </div>
          <div className={styles.actions}>
              <Link to={`/parties-matchgame/`}
                    className={styles.goMatch}>進入挑戰</Link>
              <div><Link to={`/parties-table/`}
                    className={styles.goTable}>直接看結果</Link></div>
          </div>
      </div>
    );
  }
}
@connect(
    state => ({
                parties: state.parties,
                partyBlock: state.partyBlock
              }),
    dispatch => bindActionCreators({}, dispatch))

class PartyMenu extends Component {
  render(){
    const {parties, partyBlock, side, onChangeFocus, focus} = this.props;
    const styles = require("./Parties.scss");

    // 這段跟 PKerBillboard 重疊太高
    let side1parties = [], side2parties = [];
    Object.keys(partyBlock)
          .map((partyId, index)=>{
              if(parties[partyId].side === 1){
                 side1parties.push(parties[partyId])
              }else{
                 side2parties.push(parties[partyId])
              }
          })
    let currentSide = (side ===1) ? side1parties : side2parties;
    let partyMenuItems = currentSide.map((value, index)=>{
      let outerClasses = classnames({
        [styles.hexagon]: true,
        [styles.partyMenuItem]: true
      })
      let innerClasses = classnames({
        [styles.innerHexagon]: true,
        [styles.active]: focus === value.id
      })
      return (
        <div className={outerClasses}
             key={`side-${side}-${index}`}
             onClick={onChangeFocus.bind(null,value.id)}>
             <div className={innerClasses}>
                {eng2party_short(value.id)}
             </div>
        </div>
      ) 
    })

    return (
      <div>{partyMenuItems}</div>
    )
  }
}

