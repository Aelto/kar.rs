objs = main.obj
winargs = /EHsc /I include /std:c++17 /O2 /DDEBUG

win: $(objs)
	cl $(objs) $(winargs)

main.obj: src/main.cpp src/parser/parser.h
	cl /c src/main.cpp $(winargs)

clean-win:
	del *.obj

run: main.exe
	main.exe kar/main.kar
