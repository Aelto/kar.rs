cc = cl
link = cl
obj = obj
args = -EHsc -I include -std:c++17 -O2 -DDEBUG
nolink = -c

objs = main.$(obj)

main.$(obj): src/main.cpp
	$(cc) $(nolink) src/main.cpp $(args)

all: $(objs)
	$(cc) $(objs) $(args)

clean-win:
	del *.$(obj)

run: main.exe
	main.exe kar/main.kar
