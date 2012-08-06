<div class="results lightgray row">
	<h2>FOUND <%= meta.total_count %> 1%PROJECTS</h2>
	<h3>
	Showing results <%= (1 + meta.offset) %> ~ 
	<% if ((meta.offset + meta.limit) > meta.total_count) { %>
		<%= meta.total_count %>
	<% } else { %>
		<%= (meta.offset + meta.limit) %>
	<% } %>
	</h3>
	<div class="results">
		<%= list %>	
	</div>
</div>
<% if (null !== meta.previous) { %>
	<a href="#<%= meta.previous %>" class="paginator previous">&lArr;</a>
<% } %>
<% if (null !== meta.next) { %>
	<a href="#<%= meta.next %>" class="paginator next">&rArr;</a> 
<% } %>
