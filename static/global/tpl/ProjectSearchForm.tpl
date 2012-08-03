<h2>Search Projects</h2>

<form action="/projects/" class="ajax" method="get">
	<input name="text" type="text" />
	<select name="country__contains">
		<option value="">All countries</option>
		<% _.each(items[0], function(country) { %>
			<option value="<%= country.country %>">
				<%= country.country %> (<%= country.count %>)<br/>
			</option>
		<% }) %>
	</select>


	<h3>Phase</h3>
	<input type="checkbox" id="cb_phases_idea" name="phases[]" value="idea" />
	<label for="cb_phases_idea">
		Idea
	</label><br/>
	<input type="checkbox" id="cb_phases_plan" name="phases[]" value="plan" checked />
	<label for="cb_phases_plan">
		Fund
	</label><br />
	<input type="checkbox" id="cb_phases_act" name="phases[]" value="act" />
	<label for="cb_phases_act">
		Act
	</label><br />
	<input type="checkbox" id="cb_phases_results" name="phases[]" value="results" />
	<label for="cb_phases_results">
		Results
	</label><br />
	
	<h3>Language</h3>
	<input type="checkbox" id="cb_language_nl" name="languages[]" value="nl"  />
	<label for="cb_language_nl">
		Dutch
	</label><br/>

	<input type="checkbox" id="cb_language_en" name="languages[]" value="en"  />
	<label for="cb_language_en">
		English
	</label><br />



	<h3>Themes</h3>
	
	<input type="checkbox" id="cb_themes_agriculture" name="themes[]" value="agriculture"   />
	<label for="cb_themes_agriculture">
		Agriculture
	</label><br/>
	
	<input type="checkbox" id="cb_themes_climate" name="themes[]" value="climate"   />
	<label for="cb_themes_climate">
		Climate
	</label><br/>
	
	<input type="checkbox" id="cb_themes_culture" name="themes[]" value="culture"   />
	<label for="cb_themes_culture">
		Culture
	</label><br/>
	
	<input type="checkbox" id="cb_themes_education" name="themes[]" value="education"   />
	<label for="cb_themes_education">
		Education
	</label><br/>
	
	<input type="checkbox" id="cb_themes_health" name="themes[]" value="health"   />
	<label for="cb_themes_health">
		Health
	</label><br/>

	<input type="checkbox" id="cb_themes_social-entrepreneurship" name="themes[]" value="social-entrepreneurship"   />
	<label for="cb_themes_social-entrepreneurship">
		Social Entrepreneurship
	</label><br/>
	
	<input type="checkbox" id="cb_themes_sports" name="themes[]" value="sports"   />
	<label for="cb_themes_sports">
		Sports
	</label><br/>
	
	<input type="checkbox" id="cb_themes_water" name="themes[]" value="water"   />
	<label for="cb_themes_water">
		Water
	</label><br/>
	
	<input type="checkbox" id="cb_themes_women" name="themes[]" value="women"   />
	<label for="cb_themes_women">
		Women
	</label><br/>
	
	<input type="checkbox" id="cb_themes_youth" name="themes[]" value="youth"   />
	<label for="cb_themes_youth">
		Youth
	</label><br/>
	



	<input type="submit" value="Search" />
</form>