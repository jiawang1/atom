/**
 * 
 */
package com.atom.tags;

import java.util.List;

import net.sf.cglib.core.CollectionUtils;

import com.granule.parser.Attribute;
import com.granule.parser.Element;
import com.granule.parser.Tags;
import com.granule.utils.PathUtils;
import com.sun.xml.internal.ws.policy.privateutil.PolicyUtils.Collections;
/**
 * @author i054410
 * 
 */
public class AtomCompressHandler extends AbstractTagHandler
{
	
	public AtomCompressHandler(){
		super();
	}
	
	public AtomCompressHandler(TagOptions tp){
		super();
		this.tp = tp;
	}
	/*
	 * (non-Javadoc)
	 * 
	 * @see com.atom.tag.TagsBodyHandler#process()
	 */
	@Override
	public String process(String body) throws Exception
	{
		
		List<Element> elist = getTagsFromString(body, Tags.LINK);;
		String newBody = null;
		
		if(elist != null && elist.size() > 0){
			newBody = generateBody(body,elist, "href", ".css", this.tp.getCssDestPath());
		}else{
			elist = getTagsFromString(body, Tags.SCRIPT);
			if(elist != null && elist.size() > 0 ){
				newBody = generateBody(body, elist, "src", ".js",this.tp.getJsDestPath());
			}
		}
		newBody = newBody == null?body:newBody;
		
		if(this.hasNext()){
			return this.next.process(newBody);
		}
		
		return newBody;
	}

	
	private String generateBody(String body, List<Element> els, String targetAttr, String format, String path){
		StringBuilder sb = new StringBuilder();
		int start = 0;
		for(int i = 0; i < els.size(); i++){
			Element ele = els.get(i);
			sb.append(body.substring(start, ele.getBegin()));
			
			if(i == els.size() - 1){
				Attribute a = ele.getAttributes().get(targetAttr);
				sb.append(body.substring(ele.getBegin(), a.getBegin()));
				sb.append(targetAttr + "=\"");
				sb.append(generateCombinedPath(path) + "combind.min" + format);
				sb.append("\" ");
				sb.append(body.substring(a.getEnd(), ele.getEnd()));
			}
			start = ele.getEnd();
		}
		
		return sb.toString();
	}
	
	private String generateCombinedPath(String path){
		
		if(path.startsWith(".")){
			return path.substring(path.indexOf("/"));
		}
		return path;
	}
}
