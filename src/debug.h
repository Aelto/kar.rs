#pragma once

#ifdef DEBUG
#include <iostream>
#define LOG(m) std::cout << m;
#else
#define LOG(m)  
#endif