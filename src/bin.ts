#!/usr/bin/env node

import locateChrome from '.'

locateChrome()
.then((r: string) =>{
  console.log(r);
})
.catch(console.error);
