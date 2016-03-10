/**
 * 
 */
package com.atom.tags;

import java.util.List;

import org.apache.commons.lang.StringUtils;
import org.jgroups.protocols.TP;
import javax.servlet.http.HttpServletRequest;
import net.sf.cglib.core.CollectionUtils;

import com.atom.constants.AtomConstants;
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
		
		StringBuilder _newBody = new StringBuilder();
		StringBuilder _commentBody = new StringBuilder();
		
		int _cursor = 0;
		int _from = -1;
		int _to = -1;
		
		String path = getContextRelativePath(this.tp.getHttpRequest());
		do{
			_from = body.indexOf("<!--[if",_cursor);
			if(_from >= 0){
				_newBody.append(body.substring(_cursor, _from));
				_to = body.indexOf("endif]-->", _from) + "endif]-->".length();
				_commentBody.append(body.substring(_from, _to));
				_cursor = _to;
			}else{
				if(_cursor > 0){
					_newBody.append(body.substring(_cursor));
				}
			}
		}while(_from >= 0);
		body = _newBody.length() > 0? _newBody.toString():body; 
		
		List<Element> eCSSlist = getTagsFromString(body, Tags.LINK);
		List<Element> eJSlist = getTagsFromString(body, Tags.SCRIPT);
		String newBody = null;
		
		if(eCSSlist != null && eCSSlist.size() > 0){
			String name = generateName("css");
			newBody = generateBody(body,eCSSlist, "href", name, this.tp.getCssDestPath(), _commentBody);
		}
		
		if(eJSlist != null && eJSlist.size() > 0 ){
			String name = generateName("js");
			newBody = generateBody(body, eJSlist, "src", name,this.tp.getJsDestPath(),_commentBody);
		}

		newBody = newBody == null?body:newBody;
		
		if(this.hasNext()){
			return this.next.process(newBody);
		}
		
		return newBody;
	}

	
	private String generateBody(String body, List<Element> els, String targetAttr, String filename, String path, StringBuilder comments){
		StringBuilder sb = new StringBuilder();
		StringBuilder compressTagbuffer = new StringBuilder();
		int start = 0;
		for(int i = 0; i < els.size(); i++){
			Element ele = els.get(i);
			
			if(isCodedElement(ele)){
				sb.append(body.substring(start, ele.getEnd()));
			}else if (compressTagbuffer.length() == 0){
				Attribute a = ele.getAttributes().get(targetAttr);
				compressTagbuffer.append(body.substring(ele.getBegin(), a.getBegin()));
				compressTagbuffer.append(targetAttr + "=\"");
				compressTagbuffer.append(path + filename);
				compressTagbuffer.append("\" ");
				compressTagbuffer.append(body.substring(a.getEnd(), ele.getEnd()));
			}

			if(i == els.size() - 1){
				if(comments.length() > 0){
					sb.append(comments);
				}
				sb.append(compressTagbuffer);
			}
			start = ele.getEnd();
		}
		
		return sb.toString();
	}
	
	private boolean isCodedElement(Element ele){
		return ele.getContentAsString().trim().length() > 0;
	}
	
	/*
	 * try to get path relative to WEB-INF, example
	 * if the page is localted in /WEb-INF/views/desktop/product/productPage.jsp;
	 * so this method will expected to return /views/desktop/product/productPage.jsp
	 */
	
	protected String getContextRelativePath(HttpServletRequest request)
	{
		String path = request.getPathInfo();
		if(StringUtils.isEmpty(path)){
			path = request.getServletPath();
		}
		
		return path;
	}
	
	protected String generateName(String suffix)
	{
		if(this.tp.isBaseResource()){
			return (String)this.tp.getHttpRequest().getSession().getAttribute(AtomConstants.COMPRESS_KEY + suffix);
		}else{
			String path = getContextRelativePath(this.tp.getHttpRequest());
			path = path.substring(0, path.length() - 4);
			return (String)this.tp.getHttpRequest().getSession().getAttribute((path + "_" + suffix).replaceAll("/", "_"));
		}
	}
	
}
