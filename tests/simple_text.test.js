import React from "react";
import { create } from "react-test-renderer";

import {TerminalData} from '../terminal';

describe("Plain Text Terminal Data", () => {
  test("Hi is displayed", () => {
    const button = create(
        <TerminalData 
            displayDimensions={{width: 90, height: 24}}
            data={'hi'}
            defaultForeground={'#FFFFFF'}
            defaultBackground={'#000000'}
        />
    );

    
    console.log(button.toJSON());
  });
});