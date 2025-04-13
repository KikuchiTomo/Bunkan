import classNames from "classnames";
import {
  createContext,
  FC,
  ReactNode,
  useMemo,
  useState,
  useContext,
  ReactElement,
  JSX,
} from "react";

import styles from "./TitleBar.module.css";

type TitleBarProps = {
	title: string;
}

export const TitleBar: FC<TitleBarProps> = ({ title }) => {
	  return (
	<div className={styles.titleBar}>
	  <input className={styles.title}/>
	  <div className={styles.buttonGroup}>
		<button className={classNames(styles.button, styles.close)} />
		<button className={classNames(styles.button, styles.minimize)} />
		<button className={classNames(styles.button, styles.maximize)} />
	  </div>
	</div>
  );
}
