rm ../jas.editor.js
cat \
start.js \
utils.js \
vector.js \
router.js \
elements.js \
textarea.js \
pan.js \
view.js \
view.select.js \
select.js \
undo.js \
controller.js \
graph.js \
graph.wrap.js \
end.js \
>> ../jas.editor.js

# jsdoc ./editor.js

# cd ./closure-compiler/
# java -jar compiler.jar --js_output_file=jas.editor.min.js ../editor.js
# cd -