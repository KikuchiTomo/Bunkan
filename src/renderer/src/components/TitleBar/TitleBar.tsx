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
			<div className={styles.buttonGroup}>		
			</div>	  
			<input className={styles.title} placeholder={title} />
	  		<div className={styles.buttonGroup}>		
	  		</div>
		</div>
  );
}
